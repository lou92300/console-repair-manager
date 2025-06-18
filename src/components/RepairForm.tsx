import React, { useState } from 'react';
import { Repair } from '../types';

interface RepairFormProps {
    onAddRepair?: (repair: Omit<Repair, 'id'>) => void;
    apiConnected?: boolean;
}

const RepairForm: React.FC<RepairFormProps> = ({ onAddRepair, apiConnected = true }) => {
    const [formData, setFormData] = useState({
        prenom: '',
        nom: '',
        email: '',
        numeroDeTel: '',
        numeroDeSerie: '',
        panne: '',
        prix: 0,
        dateDeRendu: '',
        initialResponsable: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'prix' ? parseFloat(value) || 0 : value,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!apiConnected) {
            alert('API non disponible. Impossible d\'ajouter la réparation.');
            return;
        }
        
        const newRepair = {
            dateDuJour: new Date().toLocaleDateString('fr-FR'),
            statut: 'en_attente' as const,
            ...formData,
        };
        
        if (onAddRepair) {
            onAddRepair(newRepair);
        }
        
        // Reset form
        setFormData({
            prenom: '',
            nom: '',
            email: '',
            numeroDeTel: '',
            numeroDeSerie: '',
            panne: '',
            prix: 0,
            dateDeRendu: '',
            initialResponsable: '',
        });
    };

    return (
        <form onSubmit={handleSubmit} className="repair-form">
            <h2>Nouvelle Réparation</h2>
            
            <div className="form-group">
                <label>Date du jour:</label>
                <input 
                    type="text" 
                    value={new Date().toLocaleDateString('fr-FR')} 
                    readOnly 
                />
            </div>

            <div className="form-group">
                <label>Prénom:</label>
                <input 
                    type="text" 
                    name="prenom" 
                    value={formData.prenom} 
                    onChange={handleChange} 
                    required 
                />
            </div>

            <div className="form-group">
                <label>Nom:</label>
                <input 
                    type="text" 
                    name="nom" 
                    value={formData.nom} 
                    onChange={handleChange} 
                    required 
                />
            </div>

            <div className="form-group">
                <label>Email:</label>
                <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                />
            </div>

            <div className="form-group">
                <label>Numéro de téléphone:</label>
                <input 
                    type="tel" 
                    name="numeroDeTel" 
                    value={formData.numeroDeTel} 
                    onChange={handleChange} 
                    required 
                />
            </div>

            <div className="form-group">
                <label>Numéro de série:</label>
                <input 
                    type="text" 
                    name="numeroDeSerie" 
                    value={formData.numeroDeSerie} 
                    onChange={handleChange} 
                    required 
                />
            </div>

            <div className="form-group">
                <label>Panne:</label>
                <textarea 
                    name="panne" 
                    value={formData.panne} 
                    onChange={handleChange} 
                    required 
                />
            </div>

            <div className="form-group">
                <label>Prix (€):</label>
                <input 
                    type="number" 
                    name="prix" 
                    value={formData.prix} 
                    onChange={handleChange} 
                    min="0" 
                    step="0.01"
                    required 
                />
            </div>

            <div className="form-group">
                <label>Date de rendu:</label>
                <input 
                    type="date" 
                    name="dateDeRendu" 
                    value={formData.dateDeRendu} 
                    onChange={handleChange} 
                    required 
                />
            </div>

            <div className="form-group">
                <label>Initiales du responsable:</label>
                <input 
                    type="text" 
                    name="initialResponsable" 
                    value={formData.initialResponsable} 
                    onChange={handleChange} 
                    maxLength={3}
                    required 
                />
            </div>

            <button type="submit">Ajouter la réparation</button>
        </form>
    );
};

export default RepairForm;