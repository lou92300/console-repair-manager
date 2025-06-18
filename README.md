# 🎮 Gestionnaire de Réparations de Consoles

Application web complète pour la gestion des réparations de consoles de jeux vidéo avec système de statuts et envoi d'emails automatiques.

## ✨ Fonctionnalités

### 🗃️ Gestion des réparations
- **Ajout** de nouvelles réparations avec toutes les informations client
- **Visualisation** de la liste complète des réparations
- **Suppression** des réparations terminées
- **Base de données JSON** persistante

### 📊 Système de statuts
- **En attente** : Réparation reçue, pas encore commencée
- **En cours** : Réparation en cours de traitement
- **Terminé** : Réparation terminée, prête à être récupérée

### 📧 Notifications automatiques
- **Email automatique** lors du passage "en cours"
- **Email automatique** lors du passage "terminé" 
- **Commentaire optionnel** pour les réparations terminées
- **Templates HTML** professionnels

## 🚀 Installation et démarrage

### Prérequis
- Node.js (version 18 ou supérieure)
- npm

### Installation
```bash
# Cloner ou télécharger le projet
cd console-repair-manager

# Installer les dépendances
npm install
```

### Démarrage rapide
```bash
# Script automatique (recommandé)
./start.sh

# OU démarrage manuel
# Terminal 1 - API
node server-simple.js

# Terminal 2 - Interface React
npm run dev
```

### URLs d'accès
- **Interface utilisateur** : http://localhost:4002
- **API REST** : http://localhost:3001

## ⚙️ Configuration email

Pour activer l'envoi automatique d'emails, modifiez le fichier `.env` :

```env
# Gmail (recommandé)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_app
EMAIL_FROM="Votre Atelier" <noreply@votre-domaine.com>
```

**Application prête pour la production !** 🎉

## Installation
1. Clonez le dépôt :
   ```
   git clone https://github.com/votre-utilisateur/console-repair-manager.git
   ```
2. Accédez au répertoire du projet :
   ```
   cd console-repair-manager
   ```
3. Installez les dépendances :
   ```
   npm install
   ```

## Utilisation
Pour démarrer l'application, exécutez la commande suivante :
```
npm start
```
L'application sera accessible à l'adresse `http://localhost:3000`.

## Structure du projet
```
console-repair-manager
├── src
│   ├── components
│   │   ├── Dashboard.tsx
│   │   ├── RepairForm.tsx
│   │   ├── RepairList.tsx
│   │   └── RepairItem.tsx
│   ├── types
│   │   └── index.ts
│   ├── utils
│   │   └── database.ts
│   ├── styles
│   │   └── main.css
│   └── App.tsx
├── public
│   └── index.html
├── package.json
├── tsconfig.json
└── README.md
```

## Contribuer
Les contributions sont les bienvenues ! Veuillez soumettre une demande de tirage pour toute amélioration ou correction.

## License
Ce projet est sous licence MIT.