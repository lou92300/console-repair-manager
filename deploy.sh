#!/bin/bash

# 🚀 Script de déploiement automatique pour Hostinger VPS
# Usage: ./deploy.sh [production|staging]

set -e  # Arrêter en cas d'erreur

# Variables
ENV=${1:-production}
APP_NAME="console-repair-manager"
APP_DIR="/home/appuser/console-repair-manager"
REPO_URL="https://github.com/lou92300/console-repair-manager.git"

echo "🚀 Déploiement de $APP_NAME en mode $ENV"

# Fonction de log
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Vérifier si PM2 est installé
if ! command -v pm2 &> /dev/null; then
    log "❌ PM2 n'est pas installé. Installation..."
    npm install -g pm2
fi

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    log "❌ Node.js n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

log "✅ Node.js version: $(node --version)"
log "✅ NPM version: $(npm --version)"

# Créer le répertoire d'application si nécessaire
if [ ! -d "$APP_DIR" ]; then
    log "📁 Création du répertoire d'application..."
    mkdir -p "$APP_DIR"
    cd "$APP_DIR"
    
    log "📦 Clonage du repository..."
    git clone "$REPO_URL" .
else
    log "📁 Répertoire d'application existant, mise à jour..."
    cd "$APP_DIR"
    
    # Sauvegarder les fichiers locaux importants
    if [ -f ".env" ]; then
        cp .env .env.backup
        log "💾 Sauvegarde de .env"
    fi
    
    if [ -f "repairs.json" ]; then
        cp repairs.json repairs.json.backup
        log "💾 Sauvegarde de repairs.json"
    fi
    
    # Mettre à jour le code
    git fetch --all
    git reset --hard origin/main
    git pull origin main
    
    # Restaurer les fichiers locaux
    if [ -f ".env.backup" ]; then
        mv .env.backup .env
        log "🔄 Restauration de .env"
    fi
    
    if [ -f "repairs.json.backup" ]; then
        mv repairs.json.backup repairs.json
        log "🔄 Restauration de repairs.json"
    fi
fi

# Vérifier la présence du fichier .env
if [ ! -f ".env" ]; then
    log "⚠️  Fichier .env manquant. Copie depuis .env.example..."
    cp .env.example .env
    log "🚨 IMPORTANT: Configurez le fichier .env avec vos vraies valeurs!"
    log "📝 Éditez: nano .env"
    exit 1
fi

# Installation des dépendances
log "📦 Installation des dépendances..."
npm ci --only=production

# Build de l'application
log "🔨 Build de l'application..."
npm run build

# Créer les dossiers nécessaires
log "📁 Création des dossiers nécessaires..."
mkdir -p logs
mkdir -p backups

# Vérifier les permissions
log "🔐 Vérification des permissions..."
chmod +x server-secure.js

# Arrêter l'ancienne instance si elle existe
if pm2 list | grep -q "$APP_NAME"; then
    log "⏹️  Arrêt de l'ancienne instance..."
    pm2 stop "$APP_NAME" || true
    pm2 delete "$APP_NAME" || true
fi

# Démarrer l'application avec PM2
log "🎯 Démarrage de l'application avec PM2..."
pm2 start ecosystem.config.js --env "$ENV"

# Sauvegarder la configuration PM2
log "💾 Sauvegarde de la configuration PM2..."
pm2 save

# Configurer le démarrage automatique
log "🔄 Configuration du démarrage automatique..."
pm2 startup || true

# Vérifier le statut
log "📊 Statut de l'application:"
pm2 status

# Afficher les logs récents
log "📋 Logs récents:"
pm2 logs "$APP_NAME" --lines 10

# Test de santé
log "🩺 Test de santé de l'application..."
sleep 5

if curl -f http://localhost:3001/api/test > /dev/null 2>&1; then
    log "✅ Application déployée avec succès!"
    log "🌐 URL locale: http://localhost:3001"
    log "📊 Statut PM2: pm2 status"
    log "📋 Logs: pm2 logs $APP_NAME"
else
    log "❌ Erreur: L'application ne répond pas"
    log "📋 Vérifiez les logs: pm2 logs $APP_NAME"
    exit 1
fi

log "🎉 Déploiement terminé!"
