# Guide de Déploiement - Board Game Club Manager

Ce guide explique comment déployer l'application complète avec backend et frontend séparés.

## 🏗️ Architecture

L'application est composée de deux parties indépendantes :

```
boardgame-club-manager/
├── backend/                 # API Node.js + Base de données
│   ├── docker-compose.yml  # Backend + MariaDB
│   └── ...
└── frontend/                # Interface React
    ├── docker-compose.yml  # Frontend Nginx
    └── ...
```

## 🚀 Déploiement complet

### 1. Prérequis

- Docker et Docker Compose installés
- Ports 3000 et 3001 disponibles

### 2. Démarrage du Backend

```bash
# Aller dans le dossier backend
cd backend

# Démarrer l'API et la base de données
docker-compose up -d

# Vérifier que l'API fonctionne
curl http://localhost:3000
# Réponse attendue : "Hello World from BCM !!!"
```

Services démarrés :
- **API Backend** : http://localhost:3000
- **Base de données** : MariaDB (interne)

### 3. Démarrage du Frontend

```bash
# Aller dans le dossier frontend
cd ../frontend

# Démarrer l'interface utilisateur
docker-compose up --build

# Vérifier que le frontend fonctionne
curl http://localhost:3001/health
# Réponse attendue : "healthy"
```

Services démarrés :
- **Frontend** : http://localhost:3001

### 4. Vérification du déploiement

1. **Backend** : http://localhost:3000
2. **Frontend** : http://localhost:3001
3. **Test de connexion** : Le frontend communique avec l'API via proxy

## 🔧 Développement

### Backend en développement

```bash
cd backend

# Démarrer uniquement la base de données
docker-compose up db -d

# Développement local avec Node.js
cd src
npm install
npm run dev  # Si disponible, sinon : node server.js
```

### Frontend en développement

```bash
cd frontend

# Option 1 : Développement avec Docker (hot reload)
docker-compose --profile dev up frontend-dev

# Option 2 : Développement local
npm install
npm run dev
```

Le mode développement inclut :
- Hot reload automatique
- Source maps pour le debugging
- Tests d'accessibilité en temps réel
- Linting automatique

## 🛠️ Configuration

### Variables d'environnement Backend

Fichier : `backend/docker-compose.yml`

```yaml
environment:
  MYSQL_DATABASE: BCM
  MYSQL_USER: bcm_user
  MYSQL_PASSWORD: password          # À changer en production !
  API_KEY: your-secret-key          # À changer en production !
  RANDOM_TOKEN_SECRET: RANDOM_SECRET_KEY  # À changer en production !
```

### Variables d'environnement Frontend

Fichier : `frontend/.env`

```bash
VITE_API_URL=http://localhost:3000
VITE_API_KEY=your-secret-key       # Doit correspondre au backend
VITE_APP_NAME="Board Game Club Manager"
VITE_NODE_ENV=development
```

## 🔒 Production

### Configuration de sécurité

1. **Changer les mots de passe par défaut**
2. **Générer de nouvelles clés secrètes**
3. **Configurer HTTPS**
4. **Activer les logs de sécurité**

### Variables de production

```bash
# Backend
MYSQL_PASSWORD=<mot-de-passe-fort>
API_KEY=<clé-api-sécurisée>
RANDOM_TOKEN_SECRET=<secret-jwt-fort>

# Frontend
VITE_API_URL=https://votre-domaine-api.com
VITE_API_KEY=<même-clé-que-backend>
VITE_NODE_ENV=production
```

## 📊 Monitoring

### Logs

```bash
# Logs backend
cd backend
docker-compose logs -f app
docker-compose logs -f db

# Logs frontend
cd frontend
docker-compose logs -f frontend
```

### Health checks

```bash
# Backend
curl http://localhost:3000

# Frontend
curl http://localhost:3001/health

# Base de données
docker exec -it db mariadb -u bcm_user -p BCM -e "SELECT 1"
```

## 🛑 Arrêt des services

```bash
# Arrêter le frontend
cd frontend
docker-compose down

# Arrêter le backend
cd ../backend
docker-compose down

# Arrêter avec suppression des volumes (⚠️ perte de données)
docker-compose down -v
```

## 🔄 Mise à jour

### Backend

```bash
cd backend
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Frontend

```bash
cd frontend
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 🆘 Dépannage

### Problèmes courants

**Port déjà utilisé**
```bash
# Vérifier les ports utilisés
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :3001

# Changer les ports dans docker-compose.yml si nécessaire
```

**Problème de connexion API**
```bash
# Vérifier que le backend est démarré
curl http://localhost:3000

# Vérifier les logs
docker-compose logs app
```

**Base de données non initialisée**
```bash
cd backend
docker-compose down -v  # ⚠️ Efface les données
docker-compose up -d
```

**Frontend ne se connecte pas à l'API**
- Vérifier `VITE_API_URL` dans `.env`
- Vérifier `VITE_API_KEY` correspond au backend
- Vérifier que le backend est accessible

### Commandes utiles

```bash
# État des conteneurs
docker ps

# Espace disque utilisé
docker system df

# Nettoyage complet
docker system prune -a --volumes  # ⚠️ Supprime tout !
```

## 📞 Support

En cas de problème :

1. Vérifier les logs : `docker-compose logs`
2. Vérifier l'état : `docker-compose ps`
3. Redémarrer : `docker-compose restart`
4. Reconstruire : `docker-compose up --build`

---

Cette architecture séparée permet :
- ✅ **Déploiements indépendants**
- ✅ **Scalabilité** (frontend et backend séparément)
- ✅ **Développement** facilité
- ✅ **Maintenance** simplifiée