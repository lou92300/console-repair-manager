import React, { useState } from 'react';
import { Repair } from '../types';

interface RepairStatusProps {
    repair: Repair;
    onStatusChange: (id: string, newStatus: 'en_attente' | 'en_cours' | 'termine', commentaire?: string) => void;
    apiConnected: boolean;
}

const RepairStatus: React.FC<RepairStatusProps> = ({ repair, onStatusChange, apiConnected }) => {
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [commentaire, setCommentaire] = useState('');
    const [pendingStatus, setPendingStatus] = useState<'en_cours' | 'termine' | null>(null);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'en_attente': return '#f39c12';
            case 'en_cours': return '#3498db';
            case 'termine': return '#27ae60';
            default: return '#95a5a6';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'en_attente': return '⏳ En attente';
            case 'en_cours': return '🔧 En cours';
            case 'termine': return '✅ Terminé';
            default: return '❓ Inconnu';
        }
    };

    const handleStatusClick = (newStatus: 'en_cours' | 'termine') => {
        if (!apiConnected) {
            alert('API non disponible.');
            return;
        }

        // Si c'est "terminé", demander un commentaire
        if (newStatus === 'termine') {
            setPendingStatus(newStatus);
            setShowCommentModal(true);
        } else {
            onStatusChange(repair.id, newStatus);
        }
    };

    const handleCommentSubmit = () => {
        if (pendingStatus) {
            onStatusChange(repair.id, pendingStatus, commentaire);
            setShowCommentModal(false);
            setCommentaire('');
            setPendingStatus(null);
        }
    };

    const handleCommentCancel = () => {
        setShowCommentModal(false);
        setCommentaire('');
        setPendingStatus(null);
    };

    return (
        <div className="repair-status">
            <div className="status-current">
                <span 
                    className="status-badge"
                    style={{ 
                        backgroundColor: getStatusColor(repair.statut),
                        color: 'white',
                        padding: '5px 10px',
                        borderRadius: '15px',
                        fontSize: '0.9rem',
                        fontWeight: 'bold'
                    }}
                >
                    {getStatusLabel(repair.statut)}
                </span>
                {repair.dateChangementStatut && (
                    <span className="status-date" style={{ fontSize: '0.8rem', color: '#666', marginLeft: '10px' }}>
                        Mis à jour le {new Date(repair.dateChangementStatut).toLocaleDateString('fr-FR')}
                    </span>
                )}
            </div>

            <div className="status-actions" style={{ marginTop: '10px' }}>
                {repair.statut === 'en_attente' && (
                    <button
                        onClick={() => handleStatusClick('en_cours')}
                        disabled={!apiConnected}
                        style={{
                            backgroundColor: '#3498db',
                            color: 'white',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            cursor: apiConnected ? 'pointer' : 'not-allowed',
                            marginRight: '10px',
                            opacity: apiConnected ? 1 : 0.5
                        }}
                    >
                        🔧 Démarrer réparation
                    </button>
                )}

                {repair.statut === 'en_cours' && (
                    <button
                        onClick={() => handleStatusClick('termine')}
                        disabled={!apiConnected}
                        style={{
                            backgroundColor: '#27ae60',
                            color: 'white',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            cursor: apiConnected ? 'pointer' : 'not-allowed',
                            marginRight: '10px',
                            opacity: apiConnected ? 1 : 0.5
                        }}
                    >
                        ✅ Marquer terminé
                    </button>
                )}

                {repair.statut === 'termine' && repair.commentaireFinal && (
                    <div className="comment-final" style={{ 
                        marginTop: '10px', 
                        padding: '10px', 
                        backgroundColor: '#e8f6f3', 
                        borderRadius: '4px',
                        borderLeft: '4px solid #27ae60'
                    }}>
                        <strong>Commentaire final :</strong> {repair.commentaireFinal}
                    </div>
                )}
            </div>

            {/* Modal pour commentaire final */}
            {showCommentModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="modal-content" style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        maxWidth: '500px',
                        width: '90%'
                    }}>
                        <h3>Réparation terminée</h3>
                        <p>Ajouter un commentaire final (optionnel) :</p>
                        <textarea
                            value={commentaire}
                            onChange={(e) => setCommentaire(e.target.value)}
                            placeholder="Ex: Remplacement de l'écran effectué, console testée et fonctionnelle..."
                            style={{
                                width: '100%',
                                height: '100px',
                                padding: '10px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                resize: 'vertical'
                            }}
                        />
                        <div style={{ marginTop: '15px', textAlign: 'right' }}>
                            <button
                                onClick={handleCommentCancel}
                                style={{
                                    backgroundColor: '#95a5a6',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 15px',
                                    borderRadius: '4px',
                                    marginRight: '10px',
                                    cursor: 'pointer'
                                }}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleCommentSubmit}
                                style={{
                                    backgroundColor: '#27ae60',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 15px',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Confirmer et envoyer email
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RepairStatus;
