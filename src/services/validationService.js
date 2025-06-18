import validator from 'validator';

export class ValidationService {
    // Nettoyer et valider les données d'entrée
    static sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        return validator.escape(input.trim());
    }

    // Valider une réparation complète
    static validateRepair(repairData) {
        const errors = [];

        // Validation du prénom
        if (!repairData.prenom || repairData.prenom.length < 2) {
            errors.push('Le prénom doit contenir au moins 2 caractères');
        }

        // Validation du nom
        if (!repairData.nom || repairData.nom.length < 2) {
            errors.push('Le nom doit contenir au moins 2 caractères');
        }

        // Validation de l'email
        if (!repairData.email || !validator.isEmail(repairData.email)) {
            errors.push('Email invalide');
        }

        // Validation du téléphone
        if (!repairData.numeroDeTel || !validator.isMobilePhone(repairData.numeroDeTel, 'fr-FR')) {
            errors.push('Numéro de téléphone invalide');
        }

        // Validation du numéro de série
        if (!repairData.numeroDeSerie || repairData.numeroDeSerie.length < 3) {
            errors.push('Le numéro de série doit contenir au moins 3 caractères');
        }

        // Validation de la panne
        if (!repairData.panne || repairData.panne.length < 5) {
            errors.push('La description de la panne doit contenir au moins 5 caractères');
        }

        // Validation du prix
        if (!repairData.prix || repairData.prix < 0 || repairData.prix > 10000) {
            errors.push('Le prix doit être compris entre 0 et 10000€');
        }

        // Validation de la date de rendu
        if (!repairData.dateDeRendu || !validator.isDate(repairData.dateDeRendu)) {
            errors.push('Date de rendu invalide');
        } else {
            const renduDate = new Date(repairData.dateDeRendu);
            const today = new Date();
            if (renduDate < today) {
                errors.push('La date de rendu ne peut pas être dans le passé');
            }
        }

        // Validation des initiales
        if (!repairData.initialResponsable || repairData.initialResponsable.length < 1) {
            errors.push('Les initiales du responsable sont requises');
        }

        return errors;
    }

    // Nettoyer toutes les données d'une réparation
    static sanitizeRepair(repairData) {
        return {
            prenom: this.sanitizeInput(repairData.prenom),
            nom: this.sanitizeInput(repairData.nom),
            email: validator.normalizeEmail(repairData.email) || repairData.email,
            numeroDeTel: this.sanitizeInput(repairData.numeroDeTel.replace(/\s/g, '')),
            numeroDeSerie: this.sanitizeInput(repairData.numeroDeSerie),
            panne: this.sanitizeInput(repairData.panne),
            prix: parseFloat(repairData.prix),
            dateDeRendu: repairData.dateDeRendu,
            initialResponsable: this.sanitizeInput(repairData.initialResponsable),
            statut: repairData.statut || 'en_attente'
        };
    }

    // Vérifier la tentative de force brute
    static checkRateLimit(ip, attempts = {}) {
        const maxAttempts = 5;
        const windowMs = 15 * 60 * 1000; // 15 minutes
        
        const now = Date.now();
        
        // Initialiser ou récupérer les tentatives pour cette IP
        if (!attempts[ip]) {
            attempts[ip] = { count: 0, firstAttempt: now };
        }
        
        const userAttempts = attempts[ip];
        
        // Reset si la fenêtre est expirée
        if (now - userAttempts.firstAttempt > windowMs) {
            attempts[ip] = { count: 1, firstAttempt: now };
            return true;
        }
        
        // Vérifier si le limite est atteint
        if (userAttempts.count >= maxAttempts) {
            return false;
        }
        
        // Incrémenter le compteur
        attempts[ip].count++;
        return true;
    }
}

export default ValidationService;
