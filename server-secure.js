import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Services de sécurité
import { AuthService } from './src/services/authServiceBackend.js';
import { EncryptionService } from './src/services/encryptionService.js';
import { ValidationService } from './src/services/validationService.js';
import { BackupService } from './src/services/backupService.js';
import { EmailService } from './src/services/emailService.js';

// Charger les variables d'environnement
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de sécurité
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limite chaque IP à 100 requêtes par windowMs
    message: {
        success: false,
        error: 'Trop de requêtes depuis cette IP, réessayez plus tard.'
    }
});

app.use('/api/', limiter);

// CORS sécurisé
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:4002',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

// Servir les fichiers statiques de React en production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
}

// Stockage des tentatives de connexion (en production, utiliser Redis)
const loginAttempts = {};

// Base de données
const DATABASE_FILE = path.join(__dirname, 'repairs.json');

// Fonctions de base de données sécurisées
function readRepairs() {
    try {
        if (!fs.existsSync(DATABASE_FILE)) {
            return [];
        }
        
        const data = JSON.parse(fs.readFileSync(DATABASE_FILE, 'utf8'));
        
        // Déchiffrer les données sensibles
        return data.map(repair => EncryptionService.decryptRepairData(repair));
    } catch (error) {
        console.error('❌ Erreur lecture base:', error);
        return [];
    }
}

function writeRepairs(repairs) {
    try {
        // Créer une sauvegarde avant modification
        const currentData = readRepairs();
        BackupService.autoBackup(currentData, 'before_write');
        
        // Chiffrer les données sensibles
        const encryptedRepairs = repairs.map(repair => 
            EncryptionService.encryptRepairData(repair)
        );
        
        fs.writeFileSync(DATABASE_FILE, JSON.stringify(encryptedRepairs, null, 2));
        console.log('💾 Base de données mise à jour (données chiffrées)');
        return true;
    } catch (error) {
        console.error('❌ Erreur écriture base:', error);
        return false;
    }
}

// Middleware de validation des erreurs
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Données invalides',
            details: errors.array()
        });
    }
    next();
};

// Routes d'authentification
app.post('/api/auth/login', [
    body('username').isLength({ min: 3 }).trim().escape(),
    body('password').isLength({ min: 6 })
], handleValidationErrors, async (req, res) => {
    try {
        const { username, password } = req.body;
        const clientIP = req.ip;
        
        // Vérifier le rate limiting pour les tentatives de connexion
        if (!ValidationService.checkRateLimit(clientIP, loginAttempts)) {
            return res.status(429).json({
                success: false,
                error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
            });
        }
        
        const user = await AuthService.authenticateUser(username, password);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Identifiants invalides'
            });
        }
        
        const token = AuthService.generateToken(user);
        
        // Reset des tentatives en cas de succès
        delete loginAttempts[clientIP];
        
        res.json({
            success: true,
            token: token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
        
    } catch (error) {
        console.error('Erreur authentification:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// Test API (public)
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'API sécurisée fonctionnelle!',
        timestamp: new Date().toISOString(),
        security: {
            encryption: 'AES-256',
            authentication: 'JWT',
            rateLimit: 'Actif'
        }
    });
});

// Routes protégées (nécessitent authentification)
app.use('/api/repairs', AuthService.requireAuth);
app.use('/api/backups', AuthService.requireAuth, AuthService.requireAdmin);

// GET toutes les réparations
app.get('/api/repairs', (req, res) => {
    try {
        const repairs = readRepairs();
        
        // Filtrer selon le statut si demandé
        const { status } = req.query;
        let filteredRepairs = repairs;
        
        if (status) {
            filteredRepairs = repairs.filter(repair => repair.statut === status);
        }
        
        // Trier par date de création
        filteredRepairs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        res.json({ success: true, data: filteredRepairs });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// POST nouvelle réparation avec validation
app.post('/api/repairs', [
    body('prenom').isLength({ min: 2 }).trim().escape(),
    body('nom').isLength({ min: 2 }).trim().escape(),
    body('email').isEmail().normalizeEmail(),
    body('numeroDeTel').isMobilePhone('fr-FR'),
    body('numeroDeSerie').isLength({ min: 3 }).trim().escape(),
    body('panne').isLength({ min: 5 }).trim().escape(),
    body('prix').isFloat({ min: 0, max: 10000 }),
    body('dateDeRendu').isISO8601(),
    body('initialResponsable').isLength({ min: 1 }).trim().escape()
], handleValidationErrors, (req, res) => {
    try {
        // Validation métier
        const validationErrors = ValidationService.validateRepair(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Données invalides',
                details: validationErrors
            });
        }
        
        // Nettoyer les données
        const cleanData = ValidationService.sanitizeRepair(req.body);
        
        const repairData = {
            ...cleanData,
            id: `repair_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: req.user.username
        };
        
        const repairs = readRepairs();
        repairs.push(repairData);
        
        if (writeRepairs(repairs)) {
            console.log(`✅ Réparation ajoutée par ${req.user.username}: ${repairData.id}`);
            res.status(201).json({ 
                success: true, 
                data: repairData,
                message: 'Réparation ajoutée avec succès' 
            });
        } else {
            res.status(500).json({ success: false, error: 'Erreur lors de l\'ajout' });
        }
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// PUT - Changer le statut d'une réparation
app.put('/api/repairs/:id/status', [
    body('statut').isIn(['en_attente', 'en_cours', 'termine']),
    body('commentaireFinal').optional().isLength({ max: 500 }).trim().escape()
], handleValidationErrors, async (req, res) => {
    try {
        const { id } = req.params;
        const { statut, commentaireFinal } = req.body;
        
        const repairs = readRepairs();
        const repairIndex = repairs.findIndex(r => r.id === id);
        
        if (repairIndex === -1) {
            return res.status(404).json({ success: false, error: 'Réparation non trouvée' });
        }
        
        const repair = repairs[repairIndex];
        repair.statut = statut;
        repair.updatedAt = new Date().toISOString();
        repair.updatedBy = req.user.username;
        
        if (commentaireFinal) {
            repair.commentaireFinal = commentaireFinal;
        }
        
        // Envoyer email de notification si statut change
        let emailSent = false;
        let emailMessage = '';
        
        try {
            await EmailService.sendRepairStatusEmail(repair, statut);
            emailSent = true;
            if (statut === 'termine') {
                emailMessage = 'Email de fin de réparation envoyé';
            } else if (statut === 'en_cours') {
                emailMessage = 'Email de début de réparation envoyé';
            } else {
                emailMessage = 'Email de changement de statut envoyé';
            }
        } catch (emailError) {
            console.error('Erreur envoi email:', emailError);
            emailMessage = 'Erreur lors de l\'envoi de l\'email: ' + emailError.message;
        }
        
        if (writeRepairs(repairs)) {
            console.log(`✅ Statut changé par ${req.user.username}: ${id} → ${statut}`);
            res.json({ 
                success: true, 
                data: repair,
                emailSent,
                emailMessage
            });
        } else {
            res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour' });
        }
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// DELETE - Supprimer une réparation
app.delete('/api/repairs/:id', (req, res) => {
    try {
        const { id } = req.params;
        
        const repairs = readRepairs();
        const initialLength = repairs.length;
        const filteredRepairs = repairs.filter(r => r.id !== id);
        
        if (filteredRepairs.length === initialLength) {
            return res.status(404).json({ success: false, error: 'Réparation non trouvée' });
        }
        
        if (writeRepairs(filteredRepairs)) {
            console.log(`✅ Réparation supprimée par ${req.user.username}: ${id}`);
            res.json({ 
                success: true, 
                message: 'Réparation supprimée avec succès' 
            });
        } else {
            res.status(500).json({ success: false, error: 'Erreur lors de la suppression' });
        }
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// POST - Envoyer une facture par email
app.post('/api/repairs/:id/invoice', async (req, res) => {
    try {
        const { id } = req.params;
        
        const repairs = readRepairs();
        const repair = repairs.find(r => r.id === id);
        
        if (!repair) {
            return res.status(404).json({ success: false, error: 'Réparation non trouvée' });
        }
        
        if (repair.statut !== 'termine') {
            return res.status(400).json({ 
                success: false, 
                error: 'Seules les réparations terminées peuvent être facturées' 
            });
        }
        
        // Générer un numéro de facture unique
        const numeroFacture = `FACT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        
        // Marquer comme facturé
        repair.numeroFacture = numeroFacture;
        repair.dateEnvoiFacture = new Date().toISOString();
        repair.factureEnvoyee = true;
        repair.updatedAt = new Date().toISOString();
        repair.updatedBy = req.user.username;
        
        // Envoyer la facture par email
        EmailService.sendInvoiceEmail(repair, numeroFacture)
            .then(() => {
                if (writeRepairs(repairs)) {
                    console.log(`✅ Facture envoyée par ${req.user.username}: ${numeroFacture} pour ${id}`);
                    res.json({ 
                        success: true, 
                        numeroFacture,
                        message: 'Facture envoyée avec succès par email',
                        data: repair
                    });
                } else {
                    res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour' });
                }
            })
            .catch(emailError => {
                console.error('Erreur envoi facture:', emailError);
                res.status(500).json({ 
                    success: false, 
                    error: 'Erreur lors de l\'envoi de la facture par email' 
                });
            });
        
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// Routes de sauvegarde (admin seulement)
app.get('/api/backups', (req, res) => {
    try {
        const backups = BackupService.listBackups();
        res.json({ success: true, data: backups });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

app.post('/api/backups/create', (req, res) => {
    try {
        const repairs = readRepairs();
        const backupPath = BackupService.createBackup(repairs, `manual_${req.user.username}`);
        
        if (backupPath) {
            res.json({ 
                success: true, 
                message: 'Sauvegarde créée avec succès',
                path: path.basename(backupPath)
            });
        } else {
            res.status(500).json({ success: false, error: 'Erreur lors de la sauvegarde' });
        }
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// Initialisation sécurisée
function initializeSecureDatabase() {
    try {
        console.log('🔐 Initialisation de la base de données sécurisée...');
        
        if (!fs.existsSync(DATABASE_FILE)) {
            writeRepairs([]);
            console.log('📄 Fichier de base créé');
        }
        
        // Migration des données existantes si nécessaire
        const repairs = readRepairs();
        let needsMigration = false;
        
        repairs.forEach(repair => {
            if (!repair.statut) {
                repair.statut = 'en_attente';
                repair.updatedAt = new Date().toISOString();
                needsMigration = true;
            }
        });
        
        if (needsMigration) {
            writeRepairs(repairs);
            console.log('🔄 Migration sécurisée terminée');
        }
        
        console.log('✅ Base de données sécurisée initialisée');
    } catch (error) {
        console.error('❌ Erreur initialisation sécurisée:', error);
    }
}

// Route catch-all pour React Router (doit être en dernier)
if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        // Ne pas intercepter les routes API
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(__dirname, 'dist', 'index.html'));
        } else {
            res.status(404).json({ success: false, error: 'Route API non trouvée' });
        }
    });
}

// Démarrage du serveur
initializeSecureDatabase();

app.listen(PORT, () => {
    console.log('🔒 Serveur sécurisé démarré');
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log('🛡️ Fonctionnalités de sécurité:');
    console.log('   ✅ Chiffrement des données sensibles');
    console.log('   ✅ Authentification JWT');
    console.log('   ✅ Rate limiting');
    console.log('   ✅ Validation des données');
    console.log('   ✅ Sauvegardes automatiques');
    console.log('   ✅ Headers de sécurité');
});

export default app;
