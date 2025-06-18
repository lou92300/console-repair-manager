import React, { useState, useEffect } from 'react';
import { Repair } from '../types';
import RepairItem from './RepairItem';
import SearchBar from './SearchBar';

interface OngoingRepairsProps {
    repairs: Repair[];
    onStatusChange?: (id: string, newStatus: 'en_attente' | 'en_cours' | 'termine', commentaire?: string) => void;
    onSendInvoice?: (id: string) => void;
    apiConnected?: boolean;
}

const OngoingRepairs: React.FC<OngoingRepairsProps> = ({ 
    repairs, 
    onStatusChange, 
    onSendInvoice,
    apiConnected = true 
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredRepairs, setFilteredRepairs] = useState<Repair[]>([]);

    // Filtrer les réparations en cours
    const ongoingRepairs = repairs.filter(repair => 
        repair.statut === 'en_cours'
    );

    useEffect(() => {
        if (!searchTerm) {
            setFilteredRepairs(ongoingRepairs);
        } else {
            const filtered = ongoingRepairs.filter(repair =>
                repair.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                repair.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                repair.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                repair.numeroDeSerie.toLowerCase().includes(searchTerm.toLowerCase()) ||
                repair.panne.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredRepairs(filtered);
        }
    }, [searchTerm, repairs]);

    const handleSearch = (term: string) => {
        setSearchTerm(term);
    };

    return (
        <div className="ongoing-repairs" style={{ padding: '20px' }}>
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '20px',
                backgroundColor: '#3498db',
                color: 'white',
                padding: '20px',
                borderRadius: '10px',
                boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)'
            }}>
                <span style={{ fontSize: '2rem', marginRight: '15px' }}>🔧</span>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Réparations en cours</h1>
                    <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>
                        {ongoingRepairs.length} réparation{ongoingRepairs.length !== 1 ? 's' : ''} en cours de traitement
                    </p>
                </div>
            </div>

            <SearchBar 
                onSearch={handleSearch}
                placeholder="Rechercher dans les réparations en cours..."
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
                                Aucune réparation en cours ne correspond à "{searchTerm}"
                            </p>
                        </>
                    ) : (
                        <>
                            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '20px' }}>✨</span>
                            <h3 style={{ color: '#7f8c8d' }}>Aucune réparation en cours</h3>
                            <p style={{ color: '#95a5a6' }}>
                                Toutes les réparations sont en attente ou terminées
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
                        <RepairItem
                            key={repair.id}
                            repair={repair}
                            onStatusChange={onStatusChange}
                            onSendInvoice={onSendInvoice}
                            apiConnected={apiConnected}
                        />
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

export default OngoingRepairs;
