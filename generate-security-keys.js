#!/usr/bin/env node

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import fs from 'fs';

console.log('🔐 Génération des clés de sécurité...\n');

// Générer une clé JWT secrète
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('🔑 Clé JWT générée');

// Générer une clé de chiffrement
const encryptionKey = crypto.randomBytes(32).toString('hex');
console.log('🔒 Clé de chiffrement générée');

// Générer un secret de session
const sessionSecret = crypto.randomBytes(32).toString('hex');
console.log('🎫 Secret de session généré');

// Demander le mot de passe admin
const readline = await import('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Entrez le mot de passe administrateur (min 8 caractères): ', async (password) => {
    if (password.length < 8) {
        console.log('❌ Le mot de passe doit contenir au moins 8 caractères');
        rl.close();
        return;
    }
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('🔐 Mot de passe hashé');
    
    // Créer le fichier .env.security
    const envContent = `# ⚠️  FICHIER DE SÉCURITÉ - NE PAS PARTAGER ⚠️
# Généré le ${new Date().toISOString()}

# Clés de sécurité
JWT_SECRET=${jwtSecret}
ENCRYPTION_KEY=${encryptionKey}
SESSION_SECRET=${sessionSecret}

# Administrateur
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=${hashedPassword}

# Configuration SMTP (à compléter)
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_app
EMAIL_FROM="Atelier Réparation" <noreply@atelier-reparation.com>

# Configuration serveur
NODE_ENV=production
PORT=3001
CORS_ORIGIN=http://localhost:4002

# Sécurité
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;
    
    try {
        fs.writeFileSync('.env.security', envContent);
        console.log('\n✅ Fichier .env.security créé avec succès!');
        console.log('\n📋 Instructions:');
        console.log('1. Copiez le contenu de .env.security vers .env');
        console.log('2. Configurez vos paramètres email');
        console.log('3. Supprimez le fichier .env.security');
        console.log('4. Ne partagez JAMAIS ces clés!');
        console.log('\n🔒 Utilisateur admin créé:');
        console.log('   Username: admin');
        console.log(`   Password: ${password}`);
        console.log('\n⚠️  Changez le mot de passe après la première connexion!');
        
    } catch (error) {
        console.error('❌ Erreur lors de la création du fichier:', error);
    }
    
    rl.close();
});
