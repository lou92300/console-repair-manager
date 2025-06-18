import React from 'react';
import RepairItem from './RepairItem';
import { Repair } from '../types';

interface RepairListProps {
    repairs: Repair[];
    onDeleteRepair?: (id: string) => void;
    onStatusChange?: (id: string, newStatus: 'en_attente' | 'en_cours' | 'termine', commentaire?: string) => void;
    onSendInvoice?: (id: string) => void;
    apiConnected?: boolean;
}

const RepairList: React.FC<RepairListProps> = ({ repairs, onDeleteRepair, onStatusChange, onSendInvoice, apiConnected = true }) => {
    return (
        <div className="repair-list">
            <h2>Liste des Réparations</h2>
            {repairs.length === 0 ? (
                <p>Aucune réparation enregistrée.</p>
            ) : (
                <ul>
                    {repairs.map((repair) => (
                        <RepairItem 
                            key={repair.id} 
                            repair={repair} 
                            onDelete={onDeleteRepair}
                            onStatusChange={onStatusChange}
                            onSendInvoice={onSendInvoice}
                            apiConnected={apiConnected}
                        />
                    ))}
                </ul>
            )}
        </div>
    );
};

export default RepairList;