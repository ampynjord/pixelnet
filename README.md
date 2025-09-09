# PixelNet

Un projet de jeu collaboratif de pixels inspiré de r/place, développé en architecture MVC avec JavaScript moderne.

## 🏗️ Architecture

- **Backend** : Node.js avec Express.js (API REST)
- **Frontend** : React 18 avec Webpack 5
- **Base de données** : MongoDB 
- **Architecture** : MVC (Model-View-Controller)

## ✨ Fonctionnalités

- 🎨 **Grille de pixels interactive** - Canvas collaboratif en temps réel
- 🌈 **Coloration de pixels** - Palette de couleurs pour personnaliser
- ⏱️ **Limitation par IP** - Un pixel toutes les 5 minutes par ordinateur (détection par adresse IP)
- 🔒 **Anti-spam intégré** - Système de cooldown automatique sans authentification
- 🏆 **Système de scores** - Classement des contributions utilisateurs
- 🔄 **Synchronisation temps réel** - Mise à jour instantanée des pixels

## 🎮 Règles du jeu

### Limitation temporelle
- **Cooldown de 5 minutes** : Chaque ordinateur (identifié par son adresse IP) ne peut placer qu'un seul pixel toutes les 5 minutes
- **Aucune authentification requise** : Pas besoin de créer un compte, le jeu est accessible immédiatement
- **Protection anti-spam** : Le système bloque automatiquement les tentatives de placement multiple depuis la même IP

### Mécanisme de fonctionnement
1. Un utilisateur clique sur un pixel et choisit une couleur
2. L'adresse IP est enregistrée avec l'horodatage
3. Pendant 5 minutes, cette IP ne peut plus placer de pixel
4. Un timer s'affiche pour indiquer le temps restant avant le prochain placement

## 📁 Structure du projet

```
pixelnet/
├── backend/           # API REST Express.js
│   ├── server.js      # Point d'entrée du serveur
│   └── package.json   # Dépendances backend
├── frontend/          # Application React
│   ├── src/
│   │   ├── App.js     # Composant principal
│   │   ├── index.js   # Point d'entrée React
│   │   └── style.css  # Styles CSS
│   ├── public/
│   │   └── index.html # Template HTML
│   ├── webpack.config.js  # Configuration Webpack
│   ├── .babelrc       # Configuration Babel/JSX
│   └── package.json   # Dépendances frontend
├── mongodb-data/      # Données MongoDB locales
└── README.md          # Documentation
```

## 🚀 Installation et démarrage

### Prérequis

- Node.js (v18 ou supérieur)
- MongoDB Community Server
- npm ou yarn

### Installation

1. **Cloner le repository**
   ```bash
   git clone https://github.com/ampynjord/pixelnet.git
   cd pixelnet
   ```

2. **Installer les dépendances du backend**
   ```bash
   cd backend
   npm install
   ```

3. **Installer les dépendances du frontend**
   ```bash
   cd ../frontend
   npm install
   ```

### Démarrage de l'application

⚠️ **Important** : Les services doivent être démarrés dans l'ordre suivant :

1. **Démarrer MongoDB**
   ```bash
   # Dans le répertoire racine du projet
   mongod --dbpath "mongodb-data"
   ```

2. **Démarrer le backend** (nouveau terminal)
   ```bash
   cd backend
   npm start
   ```
   > 🌐 Backend disponible sur : http://localhost:3001

3. **Démarrer le frontend** (nouveau terminal)
   ```bash
   cd frontend
   npm start
   ```
   > 🌐 Frontend disponible sur : http://localhost:3000

## 🛠️ Technologies utilisées

### Backend
- **Express.js** - Framework web Node.js
- **Mongoose** - ODM pour MongoDB
- **Rate limiting par IP** - Gestion du cooldown de 5 minutes par adresse IP

### Frontend  
- **React 18** - Bibliothèque UI avec hooks
- **Webpack 5** - Bundler et serveur de développement
- **Babel** - Transpilation ES6+ et JSX
- **CSS3** - Styles et animations

### Base de données
- **MongoDB** - Base de données NoSQL orientée documents

## 📋 Scripts disponibles

### Backend (`/backend`)
- `npm start` - Démarre le serveur Express en production

### Frontend (`/frontend`)
- `npm start` - Démarre le serveur de développement Webpack avec hot reload
- `npm run build` - Build de production optimisé

## 🔧 Configuration

### Ports utilisés
- **Frontend** : 3000 (webpack-dev-server)
- **Backend** : 3001 (Express.js)
- **MongoDB** : 27017 (base de données)


## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
