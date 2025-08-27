# Board Game Club Manager

Application de gestion complète pour clubs de jeux de société. Gérez vos jeux, membres, adhésions et emprunts avec une interface moderne et accessible.

## 🚀 Démarrage rapide

```bash
# Script de démarrage automatique
./scripts/start.sh

# Options disponibles
./scripts/start.sh all        # Démarrer backend + frontend (défaut)
./scripts/start.sh backend    # Démarrer uniquement le backend
./scripts/start.sh frontend   # Démarrer uniquement le frontend
./scripts/start.sh status     # Voir l'état des services
./scripts/start.sh stop       # Arrêter tous les services
./scripts/start.sh restart    # Redémarrer tous les services

# Pour un redémarrage rapide après modifications
./scripts/restart.sh
```

**URLs disponibles :**
- 🎮 **Frontend** : http://localhost:3001
- 🔧 **API Backend** : http://localhost:3000

## 📋 État du projet

✅ **Phase 1 - Configuration (Terminée)**
- Backend Node.js + MariaDB opérationnel
- Frontend React + TypeScript configuré
- Docker + Nginx sécurisé
- Accessibilité RGAA 4.1 complète

🔄 **Phase 2 - À venir**
- Authentification et sécurité
- Interface utilisateur complète
- Gestion des entités (jeux, membres, emprunts)

## Features

### 1. Game Management
- **Add a Game**: Create new entries for available games, including details like name, description, photo, etc.
- **Update a Game**: Edit the information of an existing game.
- **Delete a Game**: Remove a game from the database.

### 2. Member Management
- **Add a Member**: Register new members by recording their contact information and a photo.
- **Update a Member**: Update contact details or photos of existing members.
- **Delete a Member**: Remove members who are no longer active in the association.

### 3. Season Management
- **Create a Season**: Define a new registration period, typically lasting one year.
- **Manage Seasons**: Handle past and current registration periods, allowing easy tracking of memberships.

### 4. Membership Management
- **Record Memberships**: Manage member registrations for a given season, with or without a deposit for game loans.
- **View Membership History**: Track member memberships across different seasons.

### 5. Game Loan Management
- **Record a Loan**: Track game loans by members, including the loan date.
- **Manage Returns**: Record the return date of a game along with any associated comments.
- **View Loan History**: Access a detailed history of loans for each member.

### 6. Statistics
- **General Statistics**: Get insights on the number of games, members, memberships, and loans.
- **Specific Statistics**: Analyze trends like the most borrowed games, periods of high activity, etc.

## 🛠️ Technologies utilisées

### Backend
- **Node.js** + Express.js (API REST)
- **MariaDB** (Base de données)
- **JWT** (Authentification)
- **Multer** (Upload de fichiers)
- **bcrypt** (Chiffrement des mots de passe)

### Frontend
- **React 18** + TypeScript
- **Tailwind CSS** + Radix UI
- **Vite** (Build tool)
- **React Router v6**
- **React Query** (Cache API)

### DevOps & Qualité
- **Docker** + Docker Compose
- **Nginx** (Reverse proxy sécurisé)
- **ESLint** + Prettier
- **Vitest** (Tests)
- **Accessibilité RGAA 4.1**

## 📁 Structure du projet

```
boardgame-club-manager/
├── backend/                 # API Node.js + Base de données
│   ├── src/                # Code source API
│   ├── sql/                # Scripts base de données  
│   ├── docker-compose.yml  # Backend + MariaDB
│   └── Dockerfile
├── frontend/               # Interface React
│   ├── src/               # Code source frontend
│   ├── docker-compose.yml # Frontend Nginx
│   └── Dockerfile
├── scripts/               # Scripts utilitaires
│   ├── start.sh           # Script de démarrage principal
│   ├── restart.sh         # Redémarrage rapide
│   ├── import_test_data.sh # Import des données de test
│   └── download_images.sh # Téléchargement d'images
├── DEPLOYMENT.md          # Guide de déploiement
└── ROADMAP.md            # Plan de développement
```

## 🚀 Installation & Déploiement

### Prérequis
- Docker et Docker Compose
- Ports 3000 et 3001 libres

### Démarrage simple
```bash
# Cloner le projet
git clone <repository-url>
cd boardgame-club-manager

# Démarrer l'application complète
./scripts/start.sh

# Vérifier le statut
./scripts/start.sh status

# Redémarrer après modifications du code
./scripts/restart.sh
```

### Démarrage manuel
```bash
# 1. Démarrer le backend
cd backend
docker-compose up -d

# 2. Démarrer le frontend  
cd ../frontend
docker-compose up --build -d
```

Voir [DEPLOYMENT.md](./DEPLOYMENT.md) pour le guide complet.

## 🛠️ Scripts utilitaires

### Scripts de gestion
```bash
# Démarrer l'application (backend + frontend)
./scripts/start.sh

# Redémarrer avec reconstruction des images
./scripts/restart.sh

# Télécharger des images de placeholder pour les jeux
./scripts/download_images.sh

# Importer des données de test
./scripts/import_test_data.sh
```

### Commandes utiles
```bash
# Voir les logs en temps réel
cd backend && docker-compose logs -f
cd frontend && docker-compose logs -f

# Accéder au container backend pour debug
cd backend && docker-compose exec app bash

# Nettoyer les containers et volumes
docker-compose down -v
docker system prune -a
```

## 🧪 Tests et Développement

```bash
# Tests backend
cd backend
docker-compose exec app npm test

# Tests frontend avec accessibilité
cd frontend
npm test
npm run test:a11y
```

## 📞 Support

- 📖 **Documentation** : [DEPLOYMENT.md](./DEPLOYMENT.md)
- 🛣️ **Roadmap** : [ROADMAP.md](./ROADMAP.md)
- 🐛 **Issues** : Créer une issue GitHub

## 🔐 Sécurité

- Authentification JWT
- Headers de sécurité (CSP, HSTS)
- Validation des données (Zod)
- Sanitization HTML (DOMPurify)
- Configuration Nginx sécurisée

## ♿ Accessibilité

- **RGAA 4.1** complètement conforme
- Navigation clavier complète
- Screen readers compatibles  
- Contrastes élevés (4.5:1)
- Tests automatisés d'accessibilité

