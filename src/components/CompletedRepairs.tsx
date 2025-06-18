import React, { useState, useEffect } from 'react';
import { Repair } from '../types';
import RepairItem from './RepairItem';
import SearchBar from './SearchBar';

interface CompletedRepairsProps {
    repairs: Repair[];
    onDeleteRepair?: (id: string) => void;
    onSendInvoice?: (id: string) => void;
    apiConnected?: boolean;
}

const CompletedRepairs: React.FC<CompletedRepairsProps> = ({ 
    repairs, 
    onDeleteRepair,
    onSendInvoice,
    apiConnected = true 
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredRepairs, setFilteredRepairs] = useState<Repair[]>([]);

    // Filtrer les réparations terminées
    const completedRepairs = repairs.filter(repair => 
        repair.statut === 'termine'
    );

    useEffect(() => {
        if (!searchTerm) {
            setFilteredRepairs(completedRepairs);
        } else {
            const filtered = completedRepairs.filter(repair =>
                repair.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                repair.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                repair.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                repair.numeroDeSerie.toLowerCase().includes(searchTerm.toLowerCase()) ||
                repair.panne.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (repair.commentaireFinal && repair.commentaireFinal.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredRepairs(filtered);
        }
    }, [searchTerm, repairs]);

    const handleSearch = (term: string) => {
        setSearchTerm(term);
    };

    // Calculer les statistiques
    const totalRevenue = completedRepairs.reduce((sum, repair) => sum + repair.prix, 0);

    return (
        <div className="completed-repairs" style={{ padding: '20px' }}>
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '20px',
                backgroundColor: '#27ae60',
                color: 'white',
                padding: '20px',
                borderRadius: '10px',
                boxShadow: '0 4px 15px rgba(39, 174, 96, 0.3)'
            }}>
                <span style={{ fontSize: '2rem', marginRight: '15px' }}>✅</span>
                <div style={{ flex: 1 }}>
                    <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Réparations terminées</h1>
                    <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>
                        {completedRepairs.length} réparation{completedRepairs.length !== 1 ? 's' : ''} terminée{completedRepairs.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                        💰 {totalRevenue.toFixed(2)} €
                    </div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                        Chiffre d'affaires
                    </div>
                </div>
            </div>

            <SearchBar 
                onSearch={handleSearch}
                placeholder="Rechercher dans les réparations terminées..."
            />

            {!apiConnected && (
                <div style={{
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    padding: '15px',
                    borderRadius: '5px',
                    marginBottom: '20px',
                    textAlign: 'center'
                }}>
                    ⚠️ API non disponible - Les données affichées peuvent ne pas être à jour
                </div>
            )}

            {filteredRepairs.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '50px',
                    backgroundColor: 'white',
                    borderRadius: '10px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                    {searchTerm ? (
                        <>
                            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '20px' }}>🔍</span>
                            <h3 style={{ color: '#7f8c8d' }}>Aucune réparation trouvée</h3>
                            <p style={{ color: '#95a5a6' }}>
                                Aucune réparation terminée ne correspond à "{searchTerm}"
                            </p>
                        </>
                    ) : (
                        <>
                            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '20px' }}>📋</span>
                            <h3 style={{ color: '#7f8c8d' }}>Aucune réparation terminée</h3>
                            <p style={{ color: '#95a5a6' }}>
                                Les réparations terminées apparaîtront ici
                            </p>
                        </>
                    )}
                </div>
            ) : (
                <div className="repairs-grid" style={{
                    display: 'grid',
                    gap: '20px',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))'
                }}>
                    {filteredRepairs.map(repair => (
                        <div key={repair.id} style={{ position: 'relative' }}>
                            {/* Badge "Terminé" */}
                            <div style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                backgroundColor: '#27ae60',
                                color: 'white',
                                padding: '5px 10px',
                                borderRadius: '15px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                zIndex: 10
                            }}>
                                ✅ Terminé
                            </div>
                            
                            <RepairItem
                                repair={repair}
                                onDelete={onDeleteRepair}
                                onSendInvoice={onSendInvoice}
                                apiConnected={apiConnected}
                            />
                        </div>
                    ))}
                </div>
            )}

            {searchTerm && (
                <div style={{
                    marginTop: '20px',
                    padding: '10px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '5px',
                    textAlign: 'center',
                    color: '#6c757d'
                }}>
                    {filteredRepairs.length} résultat{filteredRepairs.length !== 1 ? 's' : ''} trouvé{filteredRepairs.length !== 1 ? 's' : ''} pour "{searchTerm}"
                </div>
            )}
        </div>
    );
};

export default CompletedRepairs;
