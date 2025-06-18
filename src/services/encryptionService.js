import crypto from 'crypto';

// Clé de chiffrement (à mettre dans .env en production)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
const IV_LENGTH = 16; // Pour AES, c'est toujours 16

export class EncryptionService {
    // Chiffrer des données sensibles
    static encrypt(text) {
        if (!text) return text;
        
        try {
            const iv = crypto.randomBytes(IV_LENGTH);
            const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            
            return iv.toString('hex') + ':' + encrypted;
        } catch (error) {
            console.error('Erreur de chiffrement:', error);
            return text; // Retourner le texte original en cas d'erreur
        }
    }

    // Déchiffrer des données
    static decrypt(text) {
        if (!text || !text.includes(':')) return text;
        
        try {
            const textParts = text.split(':');
            const iv = Buffer.from(textParts.shift(), 'hex');
            const encryptedText = textParts.join(':');
            
            const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
            let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return decrypted;
        } catch (error) {
            console.error('Erreur de déchiffrement:', error);
            return text; // Retourner le texte original en cas d'erreur
        }
    }

    // Hasher des données sensibles (irréversible)
    static hash(text) {
        return crypto.createHash('sha256').update(text).digest('hex');
    }

    // Chiffrer les données sensibles d'une réparation
    static encryptRepairData(repair) {
        return {
            ...repair,
            // Chiffrer les données personnelles sensibles
            email: this.encrypt(repair.email),
            numeroDeTel: this.encrypt(repair.numeroDeTel),
            // Hash des données qui n'ont pas besoin d'être déchiffrées
            emailHash: this.hash(repair.email.toLowerCase()),
            telHash: this.hash(repair.numeroDeTel)
        };
    }

    // Déchiffrer les données d'une réparation
    static decryptRepairData(repair) {
        return {
            ...repair,
            email: this.decrypt(repair.email),
            numeroDeTel: this.decrypt(repair.numeroDeTel)
        };
    }
}

export default EncryptionService;
