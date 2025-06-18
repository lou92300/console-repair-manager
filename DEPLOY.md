# 🚀 Guide de déploiement Hostinger VPS

## 📋 Prérequis sur le VPS

```bash
# 1. Installer Node.js (version 18+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Installer PM2 globalement
sudo npm install -g pm2

# 3. Installer Git
sudo apt update
sudo apt install git

# 4. Créer un utilisateur pour l'application (optionnel mais recommandé)
sudo useradd -m -s /bin/bash appuser
sudo su - appuser
```

## 📁 Déploiement

### 1. Cloner le projet sur le VPS

```bash
# Se connecter au VPS via SSH
ssh root@votre-ip-hostinger

# Aller dans le répertoire web
cd /home/appuser  # ou /var/www/

# Cloner le projet
git clone https://github.com/lou92300/console-repair-manager.git
cd console-repair-manager
```

### 2. Configuration

```bash
# Installer les dépendances
npm install

# Copier et configurer l'environnement
cp .env.example .env
nano .env  # Éditer avec vos vraies valeurs
```

### 3. Variables d'environnement importantes (.env)

```env
# Production
NODE_ENV=production
PORT=3001

# Sécurité - CHANGEZ CES VALEURS !
JWT_SECRET=votre_jwt_secret_ultra_long_et_unique_pour_production
ENCRYPTION_KEY=votre_cle_32_caracteres_pour_aes256
ADMIN_PASSWORD_HASH=hash_bcrypt_de_votre_mot_de_passe

# Email (Gmail)
EMAIL_ENABLED=true
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=votre_mot_de_passe_application_gmail
EMAIL_FROM=Console Repair Manager <votre-email@gmail.com>

# CORS (remplacez par votre domaine)
CORS_ORIGIN=https://votre-domaine.com
```

### 4. Build et démarrage

```bash
# Build de production
npm run build

# Créer le dossier de logs
mkdir -p logs

# Démarrer avec PM2
npm run deploy

# Vérifier le statut
pm2 status
pm2 logs console-repair-manager
```

## 🌐 Configuration Nginx (recommandée)

```nginx
# /etc/nginx/sites-available/console-repair-manager
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;
    
    # Redirection vers HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name votre-domaine.com www.votre-domaine.com;
    
    # SSL Configuration (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votre-domaine.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### Activer la configuration Nginx

```bash
# Créer le lien symbolique
sudo ln -s /etc/nginx/sites-available/console-repair-manager /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
```

## 🔧 Commandes de maintenance

```bash
# Mettre à jour l'application
cd /path/to/console-repair-manager
git pull
npm run deploy:update

# Voir les logs
pm2 logs console-repair-manager

# Redémarrer l'application
pm2 restart console-repair-manager

# Voir le statut
pm2 status

# Sauvegarder la configuration PM2
pm2 save
pm2 startup
```

## 🔒 SSL avec Let's Encrypt

```bash
# Installer Certbot
sudo apt install snapd
sudo snap install --classic certbot

# Obtenir le certificat SSL
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com

# Auto-renouvellement
sudo crontab -e
# Ajouter : 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🛡️ Sécurité supplémentaire

```bash
# Firewall (UFW)
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw status

# Mise à jour automatique
sudo apt install unattended-upgrades
sudo dpkg-reconfigure unattended-upgrades
```

## ✅ Vérifications post-déploiement

1. **Application accessible** : https://votre-domaine.com
2. **Login fonctionne** : admin / votre-mot-de-passe
3. **Emails envoyés** : Tester changement de statut
4. **Factures générées** : Tester envoi de facture
5. **Données persistantes** : Redémarrer et vérifier
6. **Logs propres** : `pm2 logs` sans erreurs

## 🆘 Dépannage

```bash
# Voir les logs détaillés
pm2 logs console-repair-manager --lines 100

# Redémarrer complètement
pm2 delete console-repair-manager
npm run deploy

# Vérifier les ports
sudo netstat -tlnp | grep :3001

# Permissions des fichiers
sudo chown -R appuser:appuser /path/to/console-repair-manager
chmod 755 server-secure.js
```

---

🎯 **Votre application sera accessible sur https://votre-domaine.com**
