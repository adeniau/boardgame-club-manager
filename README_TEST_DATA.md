# Jeu de Données de Test - Board Game Club Manager

Ce répertoire contient un jeu de données complet pour tester toutes les fonctionnalités de l'application de gestion de club de jeux de société.

## 📋 Contenu du Jeu de Données

### 👥 Membres (31 au total)
- **2 Administrateurs** avec droits complets
- **29 Membres** répartis sur 3 saisons
- **Profils complets** : nom, prénom, email, téléphone, adresse, photo
- **Tags Discord** et informations de contact

### 🎲 Jeux de Société (55 au total)
- **Jeux stratégiques** : Catan, 7 Wonders, Scythe, Terraforming Mars...
- **Jeux coopératifs** : Pandemic, Gloomhaven, Spirit Island...
- **Jeux de cartes** : Dominion, Magic MTG, Sushi Go...
- **Jeux familiaux** : Dixit, Codenames, Ticket to Ride...
- **Jeux d'ambiance** : Werewolf, The Resistance, Spyfall...
- **Images placeholder** pour tous les jeux

### 📅 Saisons (4 au total)
- **2022-2023** : 20 membres, saison archivée
- **2023-2024** : 25 membres, saison archivée  
- **2024-2025** : 30 membres, **saison courante**
- **2024** : Saison de test initiale

### 🎯 Emprunts (185+ au total)
- **Emprunts retournés** avec commentaires
- **Emprunts en cours** (dans les temps)
- **Emprunts en retard** (plus de 14 jours)
- **Historique complet** sur 3 saisons
- **Statistiques d'utilisation** réalistes

### 🔔 Notifications (15+ au total)
- **Rappels de retour** (7 jours avant échéance)
- **Alertes de retard** avec priorité élevée
- **Confirmations d'emprunt** et de retour
- **Notifications système** et de maintenance
- **Messages d'erreur** et d'avertissement

### ⚙️ Préférences Utilisateur
- **Thèmes** : Clair, Sombre, Auto
- **Langues** : Français, Anglais
- **Notifications** personnalisées par type
- **Raccourcis clavier** configurables
- **Widgets de dashboard** personnalisés

## 🚀 Installation

### 1. Télécharger les Images
```bash
./download_images.sh
```
Ce script télécharge des images placeholder pour les profils des membres et les jeux.

### 2. Importer les Données
```bash
./import_test_data.sh
```
Script interactif qui :
- Vérifie que Docker fonctionne
- Propose une sauvegarde des données existantes
- Importe toutes les données de test
- Affiche les statistiques finales

## 📊 Données Générées

### Statistiques Typiques Après Import
- **31 membres** avec profils complets
- **55 jeux** avec images et disponibilité
- **185+ emprunts** répartis sur 3 saisons
- **38 emprunts en cours** pour la saison 2024-2025
- **5 emprunts en retard** avec alertes
- **15+ notifications** de différents types
- **11 préférences utilisateur** personnalisées

### Comptes de Test
- **Admin 1** : jean.martin@email.com / admin123
- **Admin 2** : marie.dubois@email.com / admin123
- **Membres** : Tous les autres utilisateurs (voir base de données)

### Emprunts en Retard (pour Tests)
- **Android: Netrunner** emprunté par Pierre (42 jours de retard)
- **Magic: MTG Commander** emprunté par Sophie (39 jours de retard)
- **Sushi Go!** emprunté par Lucas (37 jours de retard)
- **Love Letter** emprunté par Emma (32 jours de retard)
- **Avalon** emprunté par Antoine (26 jours de retard)

### Jeux les Plus Populaires
- **Catan** et ses extensions
- **Pandemic** et **7 Wonders**
- **Azul** et **Wingspan**
- **Dixit** et **Codenames**

## 🔍 Points de Test Recommandés

### 📈 Dashboard et Statistiques
- Vérifier les graphiques de statistiques d'emprunts
- Tester les filtres par saison et par membre
- Contrôler les widgets personnalisables

### 🎯 Gestion des Emprunts
- Créer de nouveaux emprunts
- Retourner des jeux empruntés
- Gérer les emprunts en retard
- Tester les commentaires d'emprunt

### 👤 Gestion des Membres
- Ajouter de nouveaux membres
- Modifier les profils existants
- Gérer les adhésions par saison
- Tester l'upload de photos

### 🎲 Catalogue des Jeux
- Ajouter de nouveaux jeux
- Modifier la disponibilité
- Uploader des images de jeux
- Filtrer et rechercher dans le catalogue

### 🔔 Système de Notifications
- Créer des rappels automatiques
- Gérer les alertes de retard
- Personnaliser les types de notifications
- Tester les notifications en temps réel

### ⚙️ Préférences et Configuration
- Changer les thèmes et langues
- Configurer les raccourcis clavier
- Personnaliser le dashboard
- Ajuster les paramètres de notifications

## 🗂️ Structure des Fichiers

```
backend/sql/
├── initialize.sql    # Structure de base
└── seed_data.sql     # Données de test complètes

backend/images/
├── member_*.jpg      # Photos de profil (31 images)
├── *.jpg            # Images des jeux (55 images)
└── placeholder-game.jpg  # Image par défaut

scripts/
├── download_images.sh     # Téléchargement des images
├── import_test_data.sh    # Import des données
└── README_TEST_DATA.md    # Cette documentation
```

## 💡 Utilisation en Développement

### Reset Complet
Pour recommencer avec des données fraîches :
```bash
docker-compose down -v
docker-compose up -d
./import_test_data.sh
```

### Sauvegarde Avant Tests
Le script d'import propose automatiquement une sauvegarde des données existantes.

### Ajout de Nouvelles Données
Modifiez le fichier `seed_data.sql` pour ajouter vos propres données de test.

---

**📝 Note** : Ce jeu de données est conçu pour tester toutes les fonctionnalités de l'application dans des conditions réalistes d'utilisation d'un club de jeux de société.