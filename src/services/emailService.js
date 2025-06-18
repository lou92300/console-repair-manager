import nodemailer from 'nodemailer';

// Configuration SMTP - Gmail
const EMAIL_CONFIG = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true pour 465, false pour les autres ports
    auth: {
        user: process.env.EMAIL_USER || 'lounes.djouani@3wa.io',
        pass: process.env.EMAIL_PASS || 'kweq fjji ogro kcnb'
    }
};

// Créer le transporteur
const transporter = nodemailer.createTransport(EMAIL_CONFIG);

export class EmailService {
    static async sendRepairStatusEmail(repair, nouveauStatut) {
        try {
            let subject = '';
            let htmlContent = '';
            
            switch (nouveauStatut) {
                case 'en_cours':
                    subject = `🔧 Réparation en cours - ${repair.numeroDeSerie}`;
                    htmlContent = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #3498db;">🔧 Réparation en cours</h2>
                            <p>Bonjour ${repair.prenom} ${repair.nom},</p>
                            <p>Nous vous informons que la réparation de votre console est maintenant <strong style="color: #f39c12;">en cours</strong>.</p>
                            
                            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="color: #2c3e50; margin-top: 0;">Détails de la réparation :</h3>
                                <p><strong>Numéro de série :</strong> ${repair.numeroDeSerie}</p>
                                <p><strong>Panne déclarée :</strong> ${repair.panne}</p>
                                <p><strong>Date prévue de rendu :</strong> ${repair.dateDeRendu}</p>
                                <p><strong>Prix :</strong> ${repair.prix}€</p>
                                <p><strong>Responsable :</strong> ${repair.initialResponsable}</p>
                            </div>
                            
                            <p>Nous vous tiendrons informé de l'avancement de la réparation.</p>
                            <p>Cordialement,<br>L'équipe de réparation</p>
                        </div>
                    `;
                    break;
                    
                case 'termine':
                    subject = `✅ Réparation terminée - ${repair.numeroDeSerie}`;
                    htmlContent = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #27ae60;">✅ Réparation terminée !</h2>
                            <p>Bonjour ${repair.prenom} ${repair.nom},</p>
                            <p>Excellente nouvelle ! La réparation de votre console est maintenant <strong style="color: #27ae60;">terminée</strong>.</p>
                            
                            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="color: #2c3e50; margin-top: 0;">Résumé de la réparation :</h3>
                                <p><strong>Numéro de série :</strong> ${repair.numeroDeSerie}</p>
                                <p><strong>Panne réparée :</strong> ${repair.panne}</p>
                                <p><strong>Prix total :</strong> ${repair.prix}€</p>
                                <p><strong>Responsable :</strong> ${repair.initialResponsable}</p>
                                ${repair.commentaireFinal ? `<p><strong>Commentaire :</strong> ${repair.commentaireFinal}</p>` : ''}
                            </div>
                            
                            <div style="background: #e8f6f3; padding: 15px; border-radius: 8px; border-left: 4px solid #27ae60;">
                                <h4 style="color: #27ae60; margin-top: 0;">🎉 Votre console est prête !</h4>
                                <p>Vous pouvez venir la récupérer dès maintenant.</p>
                                <p><strong>Nos horaires :</strong> Lun-Ven 9h-18h, Sam 9h-16h</p>
                                <p><strong>Téléphone :</strong> 01 23 45 67 89</p>
                            </div>
                            
                            <p>Merci de votre confiance !</p>
                            <p>Cordialement,<br>L'équipe de réparation</p>
                        </div>
                    `;
                    break;
                    
                default:
                    return { success: false, error: 'Statut non reconnu' };
            }
            
            const mailOptions = {
                from: process.env.EMAIL_FROM || '"Atelier Réparation" <noreply@atelier-reparation.com>',
                to: repair.email,
                subject: subject,
                html: htmlContent
            };
            
            const info = await transporter.sendMail(mailOptions);
            console.log(`📧 Email envoyé à ${repair.email}: ${info.messageId}`);
            
            return { 
                success: true, 
                messageId: info.messageId,
                message: `Email envoyé avec succès à ${repair.email}` 
            };
            
        } catch (error) {
            console.error('❌ Erreur envoi email:', error);
            return { 
                success: false, 
                error: error.message 
            };
        }
    }
    
    // Envoyer une facture par email
    static async sendInvoiceEmail(repair) {
        try {
            const subject = `📄 Facture de réparation - ${repair.numeroDeSerie}`;
            
            // Calcul de la TVA (20%)
            const prixHT = repair.prix / 1.2;
            const tva = repair.prix - prixHT;
            
            // Numéro de facture basé sur l'ID et la date
            const numeroFacture = `FAC-${new Date().getFullYear()}-${repair.id.split('_')[1]}`;
            
            const htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
                    <!-- En-tête facture -->
                    <div style="border-bottom: 3px solid #2c3e50; padding-bottom: 20px; margin-bottom: 30px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h1 style="color: #2c3e50; margin: 0;">🎮 ATELIER RÉPARATION</h1>
                                <p style="color: #7f8c8d; margin: 5px 0;">Service professionnel de réparation</p>
                            </div>
                            <div style="text-align: right;">
                                <h2 style="color: #e74c3c; margin: 0;">FACTURE</h2>
                                <p style="font-size: 18px; font-weight: bold; margin: 5px 0;">${numeroFacture}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Informations client et réparation -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
                        <div>
                            <h3 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px;">FACTURER À :</h3>
                            <p><strong>${repair.prenom} ${repair.nom}</strong></p>
                            <p>Email : ${repair.email}</p>
                            <p>Téléphone : ${repair.numeroDeTel}</p>
                        </div>
                        <div>
                            <h3 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px;">DÉTAILS :</h3>
                            <p><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
                            <p><strong>Responsable :</strong> ${repair.initialResponsable}</p>
                            <p><strong>N° de série :</strong> ${repair.numeroDeSerie}</p>
                        </div>
                    </div>

                    <!-- Tableau des services -->
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                        <thead>
                            <tr style="background: #34495e; color: white;">
                                <th style="padding: 15px; text-align: left; border: 1px solid #ddd;">DESCRIPTION</th>
                                <th style="padding: 15px; text-align: center; border: 1px solid #ddd;">QTÉ</th>
                                <th style="padding: 15px; text-align: right; border: 1px solid #ddd;">PRIX UNITAIRE HT</th>
                                <th style="padding: 15px; text-align: right; border: 1px solid #ddd;">TOTAL HT</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="background: #f8f9fa;">
                                <td style="padding: 15px; border: 1px solid #ddd;">
                                    <strong>Réparation de console</strong><br>
                                    <span style="color: #7f8c8d;">Panne : ${repair.panne}</span>
                                    ${repair.commentaireFinal ? `<br><span style="color: #27ae60; font-style: italic;">Note : ${repair.commentaireFinal}</span>` : ''}
                                </td>
                                <td style="padding: 15px; text-align: center; border: 1px solid #ddd;">1</td>
                                <td style="padding: 15px; text-align: right; border: 1px solid #ddd;">${prixHT.toFixed(2)} €</td>
                                <td style="padding: 15px; text-align: right; border: 1px solid #ddd; font-weight: bold;">${prixHT.toFixed(2)} €</td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Totaux -->
                    <div style="display: flex; justify-content: flex-end; margin-bottom: 30px;">
                        <div style="width: 300px;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 10px; text-align: right; font-weight: bold;">Sous-total HT :</td>
                                    <td style="padding: 10px; text-align: right; width: 100px;">${prixHT.toFixed(2)} €</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; text-align: right; font-weight: bold;">TVA (20%) :</td>
                                    <td style="padding: 10px; text-align: right;">${tva.toFixed(2)} €</td>
                                </tr>
                                <tr style="background: #e74c3c; color: white;">
                                    <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px;">TOTAL TTC :</td>
                                    <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px;">${repair.prix.toFixed(2)} €</td>
                                </tr>
                            </table>
                        </div>
                    </div>

                    <!-- Conditions de paiement -->
                    <div style="background: #ecf0f1; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                        <h4 style="color: #2c3e50; margin-top: 0;">💳 CONDITIONS DE PAIEMENT</h4>
                        <p>Paiement comptant à la livraison</p>
                        <p>Modes de paiement acceptés : Espèces, Carte bancaire, Chèque</p>
                        <p><strong>Date de rendu prévue :</strong> ${repair.dateDeRendu}</p>
                    </div>

                    <!-- Garantie -->
                    <div style="background: #d5f4e6; padding: 20px; border-radius: 8px; border-left: 4px solid #27ae60; margin-bottom: 30px;">
                        <h4 style="color: #27ae60; margin-top: 0;">🛡️ GARANTIE</h4>
                        <p>Cette réparation est garantie <strong>3 mois</strong> à compter de la date de livraison.</p>
                        <p>La garantie couvre les défauts de réparation mais exclut les nouveaux dommages.</p>
                    </div>

                    <!-- Pied de page -->
                    <div style="text-align: center; padding: 20px; border-top: 2px solid #bdc3c7; color: #7f8c8d; font-size: 12px;">
                        <p><strong>ATELIER RÉPARATION</strong></p>
                        <p>📍 22 Boulevard Voltaire, 75011 Paris | ☎️ +33 1 77 18 29 33| 📧 Contact@ls-atelier.fr</p>
                        <p>SIRET : 123 456 789 00012 | TVA : FR12345678901</p>
                        <p style="margin-top: 15px; font-style: italic;">Merci de votre confiance !</p>
                    </div>
                </div>
            `;
            
            const mailOptions = {
                from: process.env.EMAIL_FROM || '"Atelier Réparation" <noreply@atelier-reparation.com>',
                to: repair.email,
                subject: subject,
                html: htmlContent
            };
            
            const info = await transporter.sendMail(mailOptions);
            console.log(`📧 Facture envoyée à ${repair.email}: ${info.messageId}`);
            
            return { 
                success: true, 
                messageId: info.messageId,
                numeroFacture: numeroFacture,
                message: `Facture ${numeroFacture} envoyée avec succès à ${repair.email}` 
            };
            
        } catch (error) {
            console.error('❌ Erreur envoi facture:', error);
            return { 
                success: false, 
                error: error.message 
            };
        }
    }
    
    // Test de configuration email
    static async testEmailConfig() {
        try {
            await transporter.verify();
            console.log('✅ Configuration email valide');
            return { success: true, message: 'Configuration email valide' };
        } catch (error) {
            console.error('❌ Configuration email invalide:', error);
            return { 
                success: false, 
                error: 'Configuration email invalide. Vérifiez vos paramètres SMTP.' 
            };
        }
    }
}

export default EmailService;
