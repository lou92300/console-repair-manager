import React from 'react';
import { Repair } from '../types';
import RepairList from './RepairList';
import RepairForm from './RepairForm';

interface DashboardProps {
    repairs: Repair[];
    onAddRepair: (repair: Omit<Repair, 'id'>) => void;
    onDeleteRepair: (id: string) => void;
    onStatusChange: (id: string, newStatus: 'en_attente' | 'en_cours' | 'termine', commentaire?: string) => void;
    onSendInvoice: (id: string) => void;
    apiConnected: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ repairs, onAddRepair, onDeleteRepair, onStatusChange, onSendInvoice, apiConnected }) => {
    return (
        <div className="dashboard">
            <h1>Gestion des Réparations de Consoles</h1>
            <RepairForm onAddRepair={onAddRepair} apiConnected={apiConnected} />
            <h2>Réparations en Cours ({repairs.length})</h2>
            <RepairList repairs={repairs} onDeleteRepair={onDeleteRepair} onStatusChange={onStatusChange} onSendInvoice={onSendInvoice} apiConnected={apiConnected} />
        </div>
    );
};

export default Dashboard;