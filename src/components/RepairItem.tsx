import React from 'react';
import { Repair } from '../types';
import RepairStatus from './RepairStatus';

interface RepairItemProps {
    repair: Repair;
    onDelete?: (id: string) => void;
    onStatusChange?: (id: string, newStatus: 'en_attente' | 'en_cours' | 'termine', commentaire?: string) => void;
    onSendInvoice?: (id: string) => void;
    apiConnected?: boolean;
}

const RepairItem: React.FC<RepairItemProps> = ({ repair, onDelete, onStatusChange, onSendInvoice, apiConnected = true }) => {
    const handleDelete = () => {
        if (!apiConnected) {
            alert('API non disponible. Impossible de supprimer.');
            return;
        }
        
        if (onDelete && window.confirm(`Êtes-vous sûr de vouloir supprimer la réparation de ${repair.prenom} ${repair.nom} ?`)) {
            onDelete(repair.id);
        }
    };

    const handleSendInvoice = () => {
        if (!apiConnected) {
            alert('API non disponible. Impossible d\'envoyer la facture.');
            return;
        }
        
        if (onSendInvoice && window.confirm('Envoyer la facture par email au client ?')) {
            onSendInvoice(repair.id);
        }
    };

    return (
        <div className="repair-item">
            <div className="repair-header">
                <h3>Réparation de {repair.prenom} {repair.nom}</h3>
                <div className="repair-actions">
                    {/* Bouton d'envoi de facture */}
                    {onSendInvoice && (
                        <button 
                            onClick={handleSendInvoice}
                            className="invoice-button"
                            disabled={!apiConnected}
                            style={{
                                background: '#f39c12',
                                color: 'white',
                                border: 'none',
                                padding: '5px 10px',
                                borderRadius: '3px',
                                cursor: apiConnected ? 'pointer' : 'not-allowed',
                                opacity: apiConnected ? 1 : 0.5,
                                marginRight: '5px',
                                fontSize: '0.8rem'
                            }}
                        >
                            📄 {repair.factureEnvoyee ? 'Renvoyer facture' : 'Envoyer facture'}
                        </button>
                    )}
                    
                    {/* Bouton de suppression */}
                    {onDelete && (
                        <button 
                            onClick={handleDelete}
                            className="delete-button"
                            disabled={!apiConnected}
                            style={{
                                background: '#e74c3c',
                                color: 'white',
                                border: 'none',
                                padding: '5px 10px',
                                borderRadius: '3px',
                                cursor: apiConnected ? 'pointer' : 'not-allowed',
                                opacity: apiConnected ? 1 : 0.5,
                                fontSize: '0.8rem'
                            }}
                        >
                            🗑️ Supprimer
                        </button>
                    )}
                </div>
            </div>

            {/* Statut de la réparation */}
            {onStatusChange && (
                <RepairStatus 
                    repair={repair} 
                    onStatusChange={onStatusChange}
                    apiConnected={apiConnected}
                />
            )}

            <div className="repair-details">
                <p><strong>Date :</strong> {repair.dateDuJour}</p>
                <p><strong>Email :</strong> {repair.email}</p>
                <p><strong>Téléphone :</strong> {repair.numeroDeTel}</p>
                <p><strong>Numéro de série :</strong> {repair.numeroDeSerie}</p>
                <p><strong>Panne :</strong> {repair.panne}</p>
                <p><strong>Prix :</strong> {repair.prix}€</p>
                <p><strong>Date de rendu :</strong> {repair.dateDeRendu}</p>
                <p><strong>Responsable :</strong> {repair.initialResponsable}</p>
                
                {/* Informations de facture */}
                {repair.factureEnvoyee && (
                    <div style={{ 
                        marginTop: '10px', 
                        padding: '10px', 
                        backgroundColor: '#fff3cd', 
                        borderRadius: '4px',
                        borderLeft: '4px solid #f39c12'
                    }}>
                        <p><strong>📄 Facture :</strong> {repair.numeroFacture}</p>
                        <p><strong>Envoyée le :</strong> {repair.dateEnvoiFacture ? new Date(repair.dateEnvoiFacture).toLocaleDateString('fr-FR') : 'Non disponible'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RepairItem;