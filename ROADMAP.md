# Roadmap Frontend pour Board Game Club Manager

## Phase 1: Setup et Configuration (1-2 jours)

### 1.1 Choix technologique
- **Frontend**: React.js avec TypeScript (moderne, écosystème riche)
- **Styling**: Tailwind CSS + shadcn/ui (composants modernes, responsive)
- **State Management**: React Context + useState/useReducer (simplicité pour un projet moyen)
- **HTTP Client**: Axios (gestion d'erreurs robuste)
- **Routing**: React Router v6
- **Build Tool**: Vite (rapide, moderne)

### 1.2 Structure du projet
```
frontend/
├── src/
│   ├── components/          # Composants réutilisables
│   │   ├── ui/             # Composants de base (boutons, inputs, etc.)
│   │   ├── forms/          # Formulaires spécialisés
│   │   └── layout/         # Composants de mise en page
│   ├── pages/              # Pages principales
│   │   ├── auth/           # Pages d'authentification
│   │   ├── games/          # Gestion des jeux
│   │   ├── members/        # Gestion des membres
│   │   ├── borrowings/     # Gestion des emprunts
│   │   ├── seasons/        # Gestion des saisons
│   │   └── dashboard/      # Tableau de bord
│   ├── services/           # API calls
│   ├── context/            # Context pour l'état global
│   ├── types/              # Types TypeScript
│   ├── utils/              # Fonctions utilitaires
│   └── assets/             # Images, icônes, etc.
├── public/
├── package.json
└── docker-compose.yml
```

### 1.3 Configuration Docker
- Ajouter un service frontend au docker-compose.yml existant
- Configuration Nginx pour servir les fichiers statiques
- Hot reload en développement
- Proxy vers l'API backend

## Phase 2: Authentification et Layout (2-3 jours)

### 2.1 Système d'authentification
- Page de login avec formulaire (email/password)
- Gestion du token JWT dans localStorage
- Protection des routes privées avec React Router
- Intercepteur Axios pour l'authentification automatique
- Gestion des headers `x-api-key` et `Authorization`

### 2.2 Layout principal
- Header avec navigation et bouton logout
- Sidebar avec menu principal (Dashboard, Jeux, Membres, Emprunts, Saisons)
- Layout responsive (mobile-first)
- Composants de base réutilisables (boutons, formulaires, modales)
- Theme provider pour la cohérence visuelle

### 2.3 Routes principales
```
/ → Dashboard (protégé)
/login → Page de connexion
/games → Liste des jeux (protégé)
/games/new → Ajouter un jeu (protégé)
/games/:id → Détail d'un jeu (protégé)
/members → Liste des membres (protégé)
/members/new → Ajouter un membre (protégé)
/members/:id → Profil membre (protégé)
/borrowings → Gestion des emprunts (protégé)
/seasons → Gestion des saisons (protégé)
```

## Phase 3: Gestion des Jeux (3-4 jours)

### 3.1 Liste des jeux
- Affichage en grille avec photos des jeux
- Recherche en temps réel par nom
- Filtres par disponibilité (disponible/emprunté)
- Pagination avec navigation
- Indication visuelle du statut (disponible/emprunté)

### 3.2 CRUD Jeux
- Formulaire d'ajout de jeu avec upload d'image
- Modification des informations existantes
- Suppression avec confirmation et vérification des emprunts actifs
- Validation des formulaires avec React Hook Form
- Gestion des erreurs API

### 3.3 Détail d'un jeu
- Page détail avec toutes les informations
- Historique des emprunts pour ce jeu
- Actions rapides (prêter/marquer comme retourné)
- Statistiques d'utilisation

### 3.4 API utilisées
```
GET /api/games → Liste des jeux
GET /api/games/Random → Jeu aléatoire
GET /api/games/:id → Détail d'un jeu
POST /api/games → Créer un jeu
PUT /api/games/:id → Modifier un jeu
DELETE /api/games/:id → Supprimer un jeu
```

## Phase 4: Gestion des Membres (3-4 jours)

### 4.1 Liste des membres
- Tableau avec photos et informations principales
- Recherche par nom, prénom, email
- Filtre par statut d'adhésion actuelle
- Tri par différents critères

### 4.2 CRUD Membres
- Formulaire complet avec upload de photo
- Gestion des informations de contact complètes
- Validation des emails et numéros de téléphone
- Gestion des erreurs et feedback utilisateur

### 4.3 Profil membre
- Page détail avec toutes les informations
- Statistiques personnelles (nombre d'emprunts, durée moyenne, etc.)
- Historique complet des emprunts
- Gestion des adhésions par saison
- Actions rapides (nouveau prêt, voir historique)

### 4.4 API utilisées
```
GET /api/members → Liste des membres
GET /api/members/:id → Détail d'un membre
GET /api/members/NewMembers/:seasonId → Nouveaux membres d'une saison
POST /api/members → Créer un membre
PUT /api/members/:id → Modifier un membre
DELETE /api/members/:id → Supprimer un membre
```

## Phase 5: Gestion des Emprunts (3-4 jours)

### 5.1 Interface d'emprunt
- Recherche rapide membre avec autocomplétion
- Recherche rapide jeu avec autocomplétion
- Formulaire de prêt simple et efficace
- Validation des disponibilités en temps réel
- Sélection de la saison courante automatique

### 5.2 Gestion des retours
- Liste des emprunts en cours avec photos
- Interface de retour avec commentaires optionnels
- Calcul automatique des durées d'emprunt
- Mise à jour du statut de disponibilité des jeux

### 5.3 Historique et suivi
- Historique complet des emprunts avec filtres
- Filtres par période, membre, jeu, saison
- Vue des emprunts en retard
- Recherche avancée dans l'historique

### 5.4 API utilisées
```
GET /api/borrowings/ByMember/:id → Emprunts par membre
GET /api/borrowings/ByGame/:id → Emprunts par jeu
GET /api/borrowings/CurrentBorrowings → Emprunts en cours
POST /api/borrowings → Créer un emprunt
PUT /api/borrowings/:id → Modifier un emprunt (retour)
```

## Phase 6: Dashboard et Statistiques (2-3 jours)

### 6.1 Dashboard principal
- Widgets avec KPIs (emprunts actifs, nouveaux membres, jeux disponibles)
- Graphiques avec Chart.js ou Recharts
- Vue d'ensemble des activités récentes
- Emprunts à retourner bientôt
- Statistiques rapides de la saison courante

### 6.2 Statistiques avancées
- Jeux les plus empruntés avec graphiques
- Membres les plus actifs
- Analyses par période/saison
- Graphiques interactifs et filtres
- Export des données en CSV

### 6.3 Vues utilisées
- Utilisation des vues SQL existantes :
  - `current_borrowings`
  - `current_members`
  - `games_borrows`
  - `members_borrows`
  - `total_borrows`

## Phase 7: Fonctionnalités Avancées (2-3 jours)

### 7.1 Gestion des Saisons
- Interface de création/gestion des saisons
- Visualisation des statistiques par saison
- Migration et archivage des données
- Rapports de fin de saison

### 7.2 Recherche avancée
- Recherche globale intelligente dans tous les modules
- Filtres combinés et sauvegardés
- Suggestions en temps réel
- Historique des recherches

### 7.3 Fonctionnalités utilisateur
- Système de notifications (emprunts en retard, etc.)
- Préférences utilisateur
- Mode sombre/clair
- Raccourcis clavier

### 7.4 API Saisons
```
GET /api/seasons → Liste des saisons
POST /api/seasons → Créer une saison
PUT /api/seasons/:id → Modifier une saison
DELETE /api/seasons/:id → Supprimer une saison
GET /api/memberships → Gestion des adhésions
```

## Phase 8: Optimisation et Déploiement (1-2 jours)

### 8.1 Performance
- Lazy loading des composants et images
- Optimisation des images avec compression
- Cache des requêtes API avec React Query
- Pagination optimisée
- Debouncing des recherches

### 8.2 Tests et qualité
- Tests unitaires des composants critiques (formulaires, auth)
- Tests d'intégration avec l'API
- Validation responsive sur mobiles/tablettes
- Tests de performance
- Validation d'accessibilité

### 8.3 Documentation
- README technique pour le frontend
- Guide utilisateur avec captures d'écran
- Documentation des composants réutilisables
- Guide de déploiement

### 8.4 Configuration Docker finale
```yaml
# Ajout au docker-compose.yml existant
frontend:
  build: ./frontend
  ports:
    - "3001:80"
  depends_on:
    - app
  environment:
    - REACT_APP_API_URL=http://localhost:3000
    - REACT_APP_API_KEY=your-secret-key
  volumes:
    - ./frontend:/app
    - /app/node_modules
```

## Technologies retenues

### Core
- **React 18** + TypeScript pour la robustesse
- **Vite** comme build tool moderne
- **React Router v6** pour la navigation

### UI/UX
- **Tailwind CSS** pour le styling utilitaire
- **shadcn/ui** pour les composants de base
- **Lucide React** pour les icônes
- **React Hook Form** pour les formulaires

### Data & API
- **Axios** pour les requêtes HTTP
- **React Query/TanStack Query** pour le cache et la synchronisation
- **Zod** pour la validation des données

### Charts & Visualisation
- **Chart.js** + **react-chartjs-2** pour les graphiques
- **date-fns** pour la manipulation des dates

### Development & Build
- **ESLint** + **Prettier** pour la qualité du code
- **Husky** pour les hooks Git
- **Vitest** pour les tests unitaires

## Estimation totale : 15-20 jours de développement

### Répartition par développeur
- **Développeur Frontend Senior** : 10-12 jours
- **Développeur Frontend Junior** : 15-20 jours
- **Équipe de 2 développeurs** : 8-10 jours

### Jalons importants
- **Semaine 1** : Setup, Auth, Layout de base
- **Semaine 2** : CRUD Jeux et Membres
- **Semaine 3** : Emprunts et Dashboard
- **Semaine 4** : Statistiques, optimisations, tests

## Prérequis techniques
- Docker et Docker Compose
- Node.js 18+ pour le développement local
- Accès à l'API backend sur le port 3000
- Clé API configurée dans les variables d'environnement

## Intégration avec le backend existant
Le frontend s'intégrera parfaitement avec l'API existante :
- Authentification JWT déjà implémentée
- Routes API complètes pour tous les modules
- Upload d'images déjà configuré
- Base de données avec vues optimisées pour les statistiques