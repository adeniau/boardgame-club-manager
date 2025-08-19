# Board Game Club Manager - Frontend

Application frontend moderne pour la gestion d'un club de jeux de société, construite avec React 18, TypeScript et Tailwind CSS.

## 🚀 Fonctionnalités

- ✅ **React 18** avec TypeScript strict
- ✅ **Accessibilité RGAA 4.1** complète
- ✅ **Design responsive** mobile-first
- ✅ **Sécurité** renforcée (CSP, headers sécurisés)
- ✅ **Performance** optimisée avec Vite
- ✅ **Tests** automatisés avec Vitest
- ✅ **Docker** pour le déploiement

## 🛠️ Technologies

### Core
- **React 18** + TypeScript
- **Vite** (build tool)
- **React Router v6**

### UI/UX
- **Tailwind CSS** + plugins d'accessibilité
- **Radix UI** (composants accessibles)
- **Lucide React** (icônes)

### Qualité
- **ESLint** + règles d'accessibilité
- **Prettier** + plugin Tailwind
- **Vitest** + Testing Library
- **Husky** (hooks Git)

## 📦 Installation

### Prérequis
- Node.js 18+ 
- Docker et Docker Compose

### Développement local

```bash
# Cloner le projet
git clone <repository-url>
cd boardgame-club-manager/frontend

# Installer les dépendances
npm install

# Copier la configuration d'environnement
cp .env.example .env

# Démarrer en mode développement
npm run dev
```

### Avec Docker

```bash
# Démarrer le backend (depuis le dossier backend)
cd ../backend
docker-compose up -d

# Démarrer le frontend (depuis le dossier frontend)
cd ../frontend
docker-compose up --build
```

L'application sera disponible sur :
- **Frontend** : http://localhost:3001
- **Backend API** : http://localhost:3000

### Développement avec hot reload

```bash
# Frontend en mode développement
cd frontend
docker-compose --profile dev up frontend-dev

# Ou développement local
npm run dev
```

## 🎯 Scripts disponibles

```bash
# Développement
npm run dev              # Démarrer en mode développement
npm run build            # Build de production
npm run preview          # Prévisualiser le build

# Tests
npm run test             # Tests unitaires
npm run test:ui          # Interface des tests
npm run test:a11y        # Tests d'accessibilité

# Qualité du code
npm run lint             # Linter ESLint
npm run lint:fix         # Correction automatique
npm run type-check       # Vérification TypeScript
npm run format           # Formatage Prettier
```

## 🏗️ Architecture

```
src/
├── components/          # Composants réutilisables
│   ├── ui/             # Composants de base
│   ├── forms/          # Formulaires
│   └── layout/         # Layout et navigation
├── pages/              # Pages de l'application
├── services/           # Appels API
├── hooks/              # Hooks personnalisés
├── context/            # Contextes React
├── types/              # Types TypeScript
├── utils/              # Fonctions utilitaires
├── constants/          # Constantes
└── assets/             # Ressources statiques
```

## ♿ Accessibilité RGAA 4.1

### Fonctionnalités implémentées

- **Navigation clavier** complète
- **Skip links** pour l'accès rapide
- **ARIA labels** et landmarks
- **Contrastes** conformes (4.5:1 minimum)
- **Focus management** optimisé
- **Screen readers** compatibles
- **Responsive** jusqu'à 320px

### Tests d'accessibilité

```bash
# Tests automatisés
npm run test:a11y

# Tests manuels recommandés
# - Navigation complète au clavier (Tab/Shift+Tab)
# - Lecteur d'écran (NVDA, JAWS, VoiceOver)
# - Test de contraste
# - Test responsive sur mobile
```

## 🔒 Sécurité

### Mesures implémentées

- **Content Security Policy** (CSP) strict
- **Headers de sécurité** (HSTS, X-Frame-Options, etc.)
- **Validation** côté client avec Zod
- **Sanitization** HTML avec DOMPurify
- **Variables d'environnement** sécurisées

### Configuration Nginx

Le conteneur utilise Nginx avec :
- Headers de sécurité complets
- Compression gzip/brotli
- Cache optimisé
- Proxy sécurisé vers l'API

## 🧪 Tests

### Structure des tests

```
tests/
├── setup.ts             # Configuration globale
├── components/          # Tests de composants
├── pages/              # Tests de pages
├── hooks/              # Tests de hooks
├── utils/              # Tests d'utilitaires
└── accessibility/       # Tests d'accessibilité
```

### Commandes de test

```bash
npm test                # Tests en mode watch
npm run test:ui         # Interface graphique
npm run test:coverage   # Rapport de couverture
```

## 🚀 Déploiement

### Build de production

```bash
npm run build
```

### Docker

```bash
# Build de l'image
docker build -t bgc-frontend .

# Démarrage
docker run -p 3001:8080 bgc-frontend
```

### Variables d'environnement

```bash
# Production
VITE_API_URL=https://your-api-domain.com
VITE_API_KEY=your-production-api-key
VITE_APP_NAME="Board Game Club Manager"
VITE_NODE_ENV=production
```

## 🔧 Configuration

### TypeScript

Configuration stricte avec :
- `strict: true`
- `noUnusedLocals: true`
- `noImplicitReturns: true`
- Types d'accessibilité

### ESLint

Règles incluses :
- TypeScript strict
- React/JSX optimisé
- **Accessibilité JSX-A11Y**
- Sécurité

### Tailwind CSS

Configuration avec :
- Variables CSS personnalisées
- Plugins d'accessibilité
- Responsive mobile-first
- Classes utilitaires RGAA

## 📊 Performance

### Optimisations incluses

- **Code splitting** automatique
- **Lazy loading** des composants
- **Bundle analysis** avec Rollup
- **Cache** des requêtes API
- **Compression** d'images

### Métriques cibles

- **First Contentful Paint** < 1.5s
- **Largest Contentful Paint** < 2.5s
- **Cumulative Layout Shift** < 0.1
- **First Input Delay** < 100ms

## 🤝 Contribution

### Workflow de développement

1. Créer une branche feature
2. Développer avec tests
3. Vérifier l'accessibilité
4. Passer les linters
5. Créer une PR

### Standards de code

- **TypeScript strict** obligatoire
- **Tests unitaires** pour nouveaux composants
- **Accessibilité** validée
- **Documentation** à jour

## 📞 Support

### Problèmes courants

**Port déjà utilisé**
```bash
# Changer le port dans vite.config.ts
server: { port: 3001 }
```

**Erreurs de build**
```bash
# Nettoyer le cache
rm -rf node_modules dist
npm install
```

**Tests d'accessibilité**
```bash
# Installer axe-core globalement
npm install -g @axe-core/cli
```

## 📝 Roadmap

### Phase actuelle : Setup (✅ Terminé)
- Configuration base
- Docker et Nginx
- Accessibilité RGAA
- Sécurité renforcée

### Phase suivante : Authentification
- Login/logout
- Protection des routes
- Gestion des tokens JWT
- Layout principal

### Phases futures
- CRUD Jeux et Membres
- Gestion des emprunts
- Dashboard et statistiques
- Fonctionnalités avancées

---

## 📄 License

MIT License - voir le fichier LICENSE pour plus de détails.