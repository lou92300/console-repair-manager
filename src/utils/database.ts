import Database from 'better-sqlite3';
import { Repair } from '../types';

class RepairDatabase {
    private db: Database.Database;

    constructor() {
        // Création de la base de données SQLite
        this.db = new Database('repairs.db');
        this.initializeDatabase();
    }

    private initializeDatabase() {
        // Création de la table des réparations
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS repairs (
                id TEXT PRIMARY KEY,
                dateDuJour TEXT NOT NULL,
                prenom TEXT NOT NULL,
                nom TEXT NOT NULL,
                email TEXT NOT NULL,
                numeroDeTel TEXT NOT NULL,
                numeroDeSerie TEXT NOT NULL,
                panne TEXT NOT NULL,
                prix REAL NOT NULL,
                dateDeRendu TEXT NOT NULL,
                initialResponsable TEXT NOT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;
        
        this.db.exec(createTableQuery);
        console.log('🗃️ Base de données initialisée');
    }

    // Ajouter une nouvelle réparation
    addRepair(repair: Repair): boolean {
        try {
            const insertQuery = `
                INSERT INTO repairs (
                    id, dateDuJour, prenom, nom, email, numeroDeTel, 
                    numeroDeSerie, panne, prix, dateDeRendu, initialResponsable
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const stmt = this.db.prepare(insertQuery);
            const result = stmt.run(
                repair.id,
                repair.dateDuJour,
                repair.prenom,
                repair.nom,
                repair.email,
                repair.numeroDeTel,
                repair.numeroDeSerie,
                repair.panne,
                repair.prix,
                repair.dateDeRendu,
                repair.initialResponsable
            );
            
            console.log(`✅ Réparation ajoutée avec succès : ${repair.id}`);
            return result.changes > 0;
        } catch (error) {
            console.error('❌ Erreur lors de l\'ajout de la réparation:', error);
            return false;
        }
    }

    // Récupérer toutes les réparations
    getAllRepairs(): Repair[] {
        try {
            const selectQuery = `
                SELECT * FROM repairs 
                ORDER BY createdAt DESC
            `;
            
            const stmt = this.db.prepare(selectQuery);
            const rows = stmt.all() as any[];
            
            return rows.map(row => ({
                id: row.id,
                dateDuJour: row.dateDuJour,
                prenom: row.prenom,
                nom: row.nom,
                email: row.email,
                numeroDeTel: row.numeroDeTel,
                numeroDeSerie: row.numeroDeSerie,
                panne: row.panne,
                prix: row.prix,
                dateDeRendu: row.dateDeRendu,
                initialResponsable: row.initialResponsable,
                statut: row.statut || 'en_attente',
                dateChangementStatut: row.dateChangementStatut,
                commentaireFinal: row.commentaireFinal,
                factureEnvoyee: row.factureEnvoyee || false,
                dateEnvoiFacture: row.dateEnvoiFacture,
                numeroFacture: row.numeroFacture
            }));
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des réparations:', error);
            return [];
        }
    }

    // Récupérer une réparation par ID
    getRepairById(id: string): Repair | null {
        try {
            const selectQuery = `SELECT * FROM repairs WHERE id = ?`;
            const stmt = this.db.prepare(selectQuery);
            const row = stmt.get(id) as any;
            
            if (!row) return null;
            
            return {
                id: row.id,
                dateDuJour: row.dateDuJour,
                prenom: row.prenom,
                nom: row.nom,
                email: row.email,
                numeroDeTel: row.numeroDeTel,
                numeroDeSerie: row.numeroDeSerie,
                panne: row.panne,
                prix: row.prix,
                dateDeRendu: row.dateDeRendu,
                initialResponsable: row.initialResponsable,
                statut: row.statut || 'en_attente',
                dateChangementStatut: row.dateChangementStatut,
                commentaireFinal: row.commentaireFinal,
                factureEnvoyee: row.factureEnvoyee || false,
                dateEnvoiFacture: row.dateEnvoiFacture,
                numeroFacture: row.numeroFacture
            };
        } catch (error) {
            console.error('❌ Erreur lors de la récupération de la réparation:', error);
            return null;
        }
    }

    // Mettre à jour une réparation
    updateRepair(id: string, repair: Partial<Repair>): boolean {
        try {
            const fields = Object.keys(repair).filter(key => key !== 'id');
            const setClause = fields.map(field => `${field} = ?`).join(', ');
            const values = fields.map(field => (repair as any)[field]);
            
            const updateQuery = `
                UPDATE repairs 
                SET ${setClause}, updatedAt = CURRENT_TIMESTAMP 
                WHERE id = ?
            `;
            
            const stmt = this.db.prepare(updateQuery);
            const result = stmt.run(...values, id);
            
            console.log(`✅ Réparation mise à jour : ${id}`);
            return result.changes > 0;
        } catch (error) {
            console.error('❌ Erreur lors de la mise à jour:', error);
            return false;
        }
    }

    // Supprimer une réparation
    deleteRepair(id: string): boolean {
        try {
            const deleteQuery = `DELETE FROM repairs WHERE id = ?`;
            const stmt = this.db.prepare(deleteQuery);
            const result = stmt.run(id);
            
            console.log(`🗑️ Réparation supprimée : ${id}`);
            return result.changes > 0;
        } catch (error) {
            console.error('❌ Erreur lors de la suppression:', error);
            return false;
        }
    }

    // Rechercher des réparations
    searchRepairs(searchTerm: string): Repair[] {
        try {
            const searchQuery = `
                SELECT * FROM repairs 
                WHERE prenom LIKE ? OR nom LIKE ? OR email LIKE ? 
                   OR numeroDeSerie LIKE ? OR panne LIKE ?
                ORDER BY createdAt DESC
            `;
            
            const likeTerm = `%${searchTerm}%`;
            const stmt = this.db.prepare(searchQuery);
            const rows = stmt.all(likeTerm, likeTerm, likeTerm, likeTerm, likeTerm) as any[];
            
            return rows.map(row => ({
                id: row.id,
                dateDuJour: row.dateDuJour,
                prenom: row.prenom,
                nom: row.nom,
                email: row.email,
                numeroDeTel: row.numeroDeTel,
                numeroDeSerie: row.numeroDeSerie,
                panne: row.panne,
                prix: row.prix,
                dateDeRendu: row.dateDeRendu,
                initialResponsable: row.initialResponsable,
                statut: row.statut || 'en_attente',
                dateChangementStatut: row.dateChangementStatut,
                commentaireFinal: row.commentaireFinal,
                factureEnvoyee: row.factureEnvoyee || false,
                dateEnvoiFacture: row.dateEnvoiFacture,
                numeroFacture: row.numeroFacture
            }));
        } catch (error) {
            console.error('❌ Erreur lors de la recherche:', error);
            return [];
        }
    }

    // Obtenir des statistiques
    getStats() {
        try {
            const totalQuery = `SELECT COUNT(*) as total FROM repairs`;
            const totalStmt = this.db.prepare(totalQuery);
            const totalResult = totalStmt.get() as any;

            const totalPriceQuery = `SELECT SUM(prix) as totalPrice FROM repairs`;
            const totalPriceStmt = this.db.prepare(totalPriceQuery);
            const totalPriceResult = totalPriceStmt.get() as any;

            const pendingQuery = `SELECT COUNT(*) as pending FROM repairs WHERE dateDeRendu > date('now')`;
            const pendingStmt = this.db.prepare(pendingQuery);
            const pendingResult = pendingStmt.get() as any;

            return {
                totalRepairs: totalResult.total || 0,
                totalRevenue: totalPriceResult.totalPrice || 0,
                pendingRepairs: pendingResult.pending || 0
            };
        } catch (error) {
            console.error('❌ Erreur lors du calcul des statistiques:', error);
            return {
                totalRepairs: 0,
                totalRevenue: 0,
                pendingRepairs: 0
            };
        }
    }

    // Fermer la connexion à la base de données
    close() {
        this.db.close();
        console.log('🔒 Connexion à la base de données fermée');
    }
}

// Instance singleton de la base de données
export const repairDB = new RepairDatabase();
export default RepairDatabase;
