#!/bin/bash

# Script d'import des donnees de test pour Board Game Club Manager
# Ce script initialise la base de donnees avec un jeu de donnees complet

echo "========================================="
echo "IMPORT DES DONNEES DE TEST"
echo "Board Game Club Manager"
echo "========================================="

# Se déplacer dans le bon répertoire
cd "$(dirname "$0")/backend"

# Verification que Docker est en cours d'execution
if ! docker-compose ps | grep -q "Up"; then
    echo "❌ L'application ne semble pas démarrée."
    echo "Veuillez d'abord lancer: docker-compose up -d"
    exit 1
fi

echo "✅ Docker containers détectés"

# Attendre que la base de données soit prête
echo "⏳ Attente de la disponibilité de la base de données..."
for i in {1..30}; do
    if docker-compose exec -T db mariadb -u bcm_user -ppassword -e "SELECT 1" BCM >/dev/null 2>&1; then
        echo "✅ Base de données prête"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Timeout: La base de données n'est pas accessible"
        exit 1
    fi
    sleep 2
done

# Sauvegarde optionnelle des donnees existantes
read -p "🔄 Voulez-vous sauvegarder les données existantes avant l'import? (y/N): " backup_choice
if [[ $backup_choice =~ ^[Yy]$ ]]; then
    echo "💾 Sauvegarde des données existantes..."
    docker-compose exec -T db mariadb-dump -u bcm_user -ppassword BCM > "backup_$(date +%Y%m%d_%H%M%S).sql"
    echo "✅ Sauvegarde créée"
fi

# Confirmation de l'import
echo ""
echo "⚠️  ATTENTION: Cette opération va:"
echo "   - Supprimer toutes les données existantes (sauf l'admin)"
echo "   - Importer 30+ membres avec photos"
echo "   - Importer 50+ jeux de société avec images"
echo "   - Importer 3 saisons (2022-2023, 2023-2024, 2024-2025)"
echo "   - Importer 100+ emprunts avec différents statuts"
echo "   - Créer des notifications et préférences utilisateur"
echo ""
read -p "🔄 Continuer avec l'import? (y/N): " confirm_choice

if [[ ! $confirm_choice =~ ^[Yy]$ ]]; then
    echo "❌ Import annulé"
    exit 0
fi

# Import des donnees
echo ""
echo "📥 Import des données de test en cours..."
if docker-compose exec -T db mariadb -u bcm_user -ppassword BCM < sql/seed_data.sql; then
    echo "✅ Données importées avec succès"
else
    echo "❌ Erreur lors de l'import des données"
    exit 1
fi

# Verification de l'import
echo ""
echo "🔍 Vérification de l'import..."

# Statistiques finales
echo ""
echo "========================================="
echo "STATISTIQUES APRÈS IMPORT"
echo "========================================="

# Requetes de verification via Docker
docker-compose exec -T db mariadb -u bcm_user -ppassword BCM -e "
SELECT 'MEMBRES' as 'Table', COUNT(*) as 'Nombre' FROM members
UNION ALL
SELECT 'JEUX', COUNT(*) FROM games
UNION ALL  
SELECT 'EMPRUNTS', COUNT(*) FROM borrowings
UNION ALL
SELECT 'SAISONS', COUNT(*) FROM seasons
UNION ALL
SELECT 'NOTIFICATIONS', COUNT(*) FROM notifications
UNION ALL
SELECT 'PRÉFÉRENCES', COUNT(*) FROM user_preferences;
"

echo ""
echo "📊 Emprunts par statut:"
docker-compose exec -T db mariadb -u bcm_user -ppassword BCM -e "
SELECT 
    CASE 
        WHEN return_date IS NULL AND DATEDIFF(CURDATE(), STR_TO_DATE(borrow_date, '%Y-%m-%d')) > 14 THEN 'En retard'
        WHEN return_date IS NULL THEN 'En cours' 
        ELSE 'Retournés'
    END as 'Statut',
    COUNT(*) as 'Nombre'
FROM borrowings 
WHERE id_season = 4
GROUP BY 
    CASE 
        WHEN return_date IS NULL AND DATEDIFF(CURDATE(), STR_TO_DATE(borrow_date, '%Y-%m-%d')) > 14 THEN 'En retard'
        WHEN return_date IS NULL THEN 'En cours' 
        ELSE 'Retournés'
    END;
"

echo ""
echo "🎮 Jeux les plus empruntés (saison courante):"
docker-compose exec -T db mariadb -u bcm_user -ppassword BCM -e "
SELECT g.name as 'Jeu', COUNT(*) as 'Emprunts' 
FROM borrowings b 
JOIN games g ON b.id_game = g.id 
WHERE b.id_season = 4 
GROUP BY g.id, g.name 
ORDER BY COUNT(*) DESC 
LIMIT 5;
"

echo ""
echo "========================================="
echo "✅ IMPORT TERMINÉ AVEC SUCCÈS!"
echo "========================================="
echo ""
echo "📋 Comptes de test créés:"
echo "   👨‍💼 Admin: jean.martin@email.com / admin123"
echo "   👩‍💼 Admin: marie.dubois@email.com / admin123"
echo "   👤 Membre: pierre.moreau@email.com (mot de passe: empty)"
echo ""
echo "📈 Données disponibles:"
echo "   • 30+ membres avec profils complets"
echo "   • 50+ jeux de société"
echo "   • Emprunts avec retards et statistiques"
echo "   • Notifications en temps réel"
echo "   • Préférences utilisateur personnalisées"
echo ""
echo "🚀 Votre application est prête à être testée!"
echo "   Interface: http://localhost:3000"
echo "   API: http://localhost:3000/api"
echo ""