import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Clé secrète pour JWT (à mettre dans .env en production)
const JWT_SECRET = process.env.JWT_SECRET || 'votre_cle_secrete_tres_longue_et_complexe';

// Utilisateurs autorisés (en production, utiliser une vraie base de données)
const AUTHORIZED_USERS = [
    {
        id: 'admin',
        username: process.env.ADMIN_USERNAME || 'admin',
        password: process.env.ADMIN_PASSWORD_HASH || '$2b$10$example_hash',
        role: 'admin'
    }
];

// Debug - afficher la configuration au démarrage
console.log('🔧 Configuration authentification:');
console.log('   Username:', process.env.ADMIN_USERNAME || 'admin');
console.log('   Hash:', process.env.ADMIN_PASSWORD_HASH ? 'Défini ✅' : 'Non défini ❌');

export class AuthService {
    // Générer un token JWT
    static generateToken(user) {
        return jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                role: user.role 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
    }

    // Vérifier un token JWT
    static verifyToken(token) {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return null;
        }
    }

    // Authentifier un utilisateur
    static async authenticateUser(username, password) {
        console.log('🔍 Tentative d\'authentification pour:', username);
        console.log('🔑 Mot de passe reçu:', password);
        
        const user = AUTHORIZED_USERS.find(u => u.username === username);
        if (!user) {
            console.log('❌ Utilisateur non trouvé:', username);
            return null;
        }

        console.log('👤 Utilisateur trouvé:', user.username);
        console.log('🔒 Hash stocké:', user.password);
        console.log('🆔 ID utilisateur:', user.id);
        
        const isValidPassword = await bcrypt.compare(password, user.password);
        console.log('🧪 Résultat comparaison bcrypt:', isValidPassword);
        
        if (!isValidPassword) {
            console.log('❌ Mot de passe invalide pour:', username);
            return null;
        }

        console.log('✅ Authentification réussie pour:', username);
        return {
            id: user.id,
            username: user.username,
            role: user.role
        };
    }

    // Middleware pour vérifier l'authentification
    static requireAuth(req, res, next) {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false, 
                error: 'Token d\'authentification requis' 
            });
        }

        const token = authHeader.substring(7);
        const decoded = AuthService.verifyToken(token);
        
        if (!decoded) {
            return res.status(401).json({ 
                success: false, 
                error: 'Token invalide ou expiré' 
            });
        }

        req.user = decoded;
        next();
    }

    // Middleware pour vérifier les permissions admin
    static requireAdmin(req, res, next) {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                error: 'Permissions administrateur requises' 
            });
        }
        next();
    }
}

export default AuthService;
