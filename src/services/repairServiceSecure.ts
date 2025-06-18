import { Repair } from '../types';
import AuthService from './authService';

const API_BASE_URL = 'http://localhost:3001/api';

export class RepairService {
    // Récupérer toutes les réparations avec authentification
    static async getAllRepairs(): Promise<Repair[]> {
        try {
            const response = await AuthService.authenticatedFetch(`${API_BASE_URL}/repairs`);
            const data = await response.json();
            
            if (data.success) {
                return data.data;
            } else {
                console.error('Erreur API:', data.error);
                return [];
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des réparations:', error);
            return [];
        }
    }

    // Ajouter une nouvelle réparation avec authentification
    static async addRepair(repair: Omit<Repair, 'id'>): Promise<Repair | null> {
        try {
            const response = await AuthService.authenticatedFetch(`${API_BASE_URL}/repairs`, {
                method: 'POST',
                body: JSON.stringify(repair),
            });
            
            const data = await response.json();
            
            if (data.success) {
                console.log('✅ Réparation ajoutée:', data.data);
                return data.data;
            } else {
                console.error('Erreur API:', data.error);
                return null;
            }
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la réparation:', error);
            return null;
        }
    }

    // Supprimer une réparation avec authentification
    static async deleteRepair(id: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await AuthService.authenticatedFetch(`${API_BASE_URL}/repairs/${id}`, {
                method: 'DELETE',
            });
            
            const data = await response.json();
            
            if (data.success) {
                console.log('✅ Réparation supprimée:', id);
                return { success: true, message: 'Réparation supprimée avec succès' };
            } else {
                console.error('Erreur API:', data.error);
                return { success: false, message: data.error || 'Erreur lors de la suppression' };
            }
        } catch (error) {
            console.error('Erreur lors de la suppression de la réparation:', error);
            return { success: false, message: 'Erreur de connexion' };
        }
    }

    // Changer le statut d'une réparation avec authentification
    static async changeRepairStatus(id: string, newStatus: 'en_attente' | 'en_cours' | 'termine', commentaire?: string): Promise<{ repair: Repair | null; emailSent: boolean; message: string }> {
        try {
            const body: any = { statut: newStatus };
            if (commentaire) {
                body.commentaireFinal = commentaire;
            }

            const response = await AuthService.authenticatedFetch(`${API_BASE_URL}/repairs/${id}/status`, {
                method: 'PUT',
                body: JSON.stringify(body),
            });
            
            const data = await response.json();
            
            if (data.success) {
                console.log('✅ Statut changé:', data.data);
                return {
                    repair: data.data,
                    emailSent: data.emailSent || false,
                    message: data.emailMessage || 'Statut mis à jour'
                };
            } else {
                console.error('Erreur API:', data.error);
                return {
                    repair: null,
                    emailSent: false,
                    message: data.error || 'Erreur lors du changement de statut'
                };
            }
        } catch (error) {
            console.error('Erreur lors du changement de statut:', error);
            return {
                repair: null,
                emailSent: false,
                message: 'Erreur de connexion'
            };
        }
    }

    // Envoyer une facture par email avec authentification
    static async sendInvoice(id: string): Promise<{ success: boolean; numeroFacture?: string; message: string }> {
        try {
            const response = await AuthService.authenticatedFetch(`${API_BASE_URL}/repairs/${id}/invoice`, {
                method: 'POST',
            });
            
            const data = await response.json();
            
            if (data.success) {
                console.log('✅ Facture envoyée:', data.numeroFacture);
                return {
                    success: true,
                    numeroFacture: data.numeroFacture,
                    message: data.message
                };
            } else {
                console.error('Erreur API:', data.error);
                return {
                    success: false,
                    message: data.error || 'Erreur lors de l\'envoi de la facture'
                };
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi de la facture:', error);
            return {
                success: false,
                message: 'Erreur de connexion'
            };
        }
    }

    // Test de connectivité API
    static async testConnection(): Promise<boolean> {
        return await AuthService.validateToken();
    }
}
