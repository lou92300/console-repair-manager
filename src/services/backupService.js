import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class BackupService {
    static BACKUP_DIR = path.join(__dirname, '../../backups');
    static MAX_BACKUPS = 10; // Garder 10 sauvegardes maximum

    // Créer le dossier de sauvegarde s'il n'existe pas
    static ensureBackupDir() {
        if (!fs.existsSync(this.BACKUP_DIR)) {
            fs.mkdirSync(this.BACKUP_DIR, { recursive: true });
        }
    }

    // Créer une sauvegarde
    static createBackup(data, reason = 'manual') {
        try {
            this.ensureBackupDir();
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `repairs_backup_${timestamp}_${reason}.json`;
            const filepath = path.join(this.BACKUP_DIR, filename);
            
            const backupData = {
                timestamp: new Date().toISOString(),
                reason: reason,
                version: '1.0',
                dataCount: data.length,
                data: data
            };
            
            fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));
            
            console.log(`📁 Sauvegarde créée: ${filename}`);
            
            // Nettoyer les anciennes sauvegardes
            this.cleanOldBackups();
            
            return filepath;
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde:', error);
            return null;
        }
    }

    // Nettoyer les anciennes sauvegardes
    static cleanOldBackups() {
        try {
            const files = fs.readdirSync(this.BACKUP_DIR)
                .filter(file => file.startsWith('repairs_backup_') && file.endsWith('.json'))
                .map(file => ({
                    name: file,
                    path: path.join(this.BACKUP_DIR, file),
                    time: fs.statSync(path.join(this.BACKUP_DIR, file)).mtime
                }))
                .sort((a, b) => b.time - a.time);
            
            // Supprimer les sauvegardes en excès
            if (files.length > this.MAX_BACKUPS) {
                const filesToDelete = files.slice(this.MAX_BACKUPS);
                filesToDelete.forEach(file => {
                    fs.unlinkSync(file.path);
                    console.log(`🗑️ Ancienne sauvegarde supprimée: ${file.name}`);
                });
            }
        } catch (error) {
            console.error('❌ Erreur lors du nettoyage des sauvegardes:', error);
        }
    }

    // Restaurer depuis une sauvegarde
    static restoreFromBackup(backupFilename) {
        try {
            const filepath = path.join(this.BACKUP_DIR, backupFilename);
            
            if (!fs.existsSync(filepath)) {
                throw new Error('Fichier de sauvegarde introuvable');
            }
            
            const backupContent = JSON.parse(fs.readFileSync(filepath, 'utf8'));
            
            if (!backupContent.data || !Array.isArray(backupContent.data)) {
                throw new Error('Format de sauvegarde invalide');
            }
            
            console.log(`🔄 Restauration depuis: ${backupFilename}`);
            console.log(`📊 ${backupContent.dataCount} réparations à restaurer`);
            
            return backupContent.data;
        } catch (error) {
            console.error('❌ Erreur lors de la restauration:', error);
            return null;
        }
    }

    // Lister les sauvegardes disponibles
    static listBackups() {
        try {
            this.ensureBackupDir();
            
            const files = fs.readdirSync(this.BACKUP_DIR)
                .filter(file => file.startsWith('repairs_backup_') && file.endsWith('.json'))
                .map(file => {
                    const filepath = path.join(this.BACKUP_DIR, file);
                    const stats = fs.statSync(filepath);
                    
                    try {
                        const content = JSON.parse(fs.readFileSync(filepath, 'utf8'));
                        return {
                            filename: file,
                            timestamp: content.timestamp,
                            reason: content.reason,
                            dataCount: content.dataCount,
                            size: stats.size,
                            created: stats.mtime
                        };
                    } catch {
                        return {
                            filename: file,
                            timestamp: 'inconnu',
                            reason: 'inconnu',
                            dataCount: 0,
                            size: stats.size,
                            created: stats.mtime
                        };
                    }
                })
                .sort((a, b) => new Date(b.created) - new Date(a.created));
            
            return files;
        } catch (error) {
            console.error('❌ Erreur lors de la lecture des sauvegardes:', error);
            return [];
        }
    }

    // Sauvegarde automatique (à appeler avant modifications importantes)
    static autoBackup(data, operation) {
        return this.createBackup(data, `auto_${operation}`);
    }
}

export default BackupService;
