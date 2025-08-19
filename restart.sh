#!/bin/bash

# Script pour redémarrer les containers Docker de Board Game Club Manager
# Permet de voir les changements après modification du code

echo "🔄 Redémarrage de Board Game Club Manager..."
echo ""

# Fonction pour afficher les messages colorés
print_step() {
    echo -e "\033[1;34m==> $1\033[0m"
}

print_success() {
    echo -e "\033[1;32m✅ $1\033[0m"
}

print_error() {
    echo -e "\033[1;31m❌ $1\033[0m"
}

# Vérifier si nous sommes dans le bon répertoire
if [[ ! -f "CLAUDE.md" ]]; then
    print_error "Veuillez exécuter ce script depuis la racine du projet"
    exit 1
fi

# Redémarrer le backend
print_step "Redémarrage du backend..."
cd backend
if docker-compose down; then
    print_success "Backend arrêté"
else
    print_error "Erreur lors de l'arrêt du backend"
fi

if docker-compose up -d --build; then
    print_success "Backend redémarré et reconstruit"
else
    print_error "Erreur lors du redémarrage du backend"
    exit 1
fi

# Attendre que le backend soit prêt
print_step "Vérification du backend..."
sleep 3
if curl -s http://localhost:3000/ > /dev/null; then
    print_success "Backend opérationnel sur http://localhost:3000"
else
    print_error "Le backend ne répond pas sur le port 3000"
fi

cd ..

# Redémarrer le frontend
print_step "Redémarrage du frontend..."
cd frontend
if docker-compose down; then
    print_success "Frontend arrêté"
else
    print_error "Erreur lors de l'arrêt du frontend"
fi

if docker-compose up -d --build; then
    print_success "Frontend redémarré et reconstruit"
else
    print_error "Erreur lors du redémarrage du frontend"
    exit 1
fi

# Attendre que le frontend soit prêt
print_step "Vérification du frontend..."
sleep 5
if curl -s http://localhost:3001/ > /dev/null; then
    print_success "Frontend opérationnel sur http://localhost:3001"
else
    print_error "Le frontend ne répond pas sur le port 3001"
fi

cd ..

echo ""
print_success "🎉 Redémarrage terminé !"
echo ""
echo "📱 Application disponible sur:"
echo "   Frontend: http://localhost:3001"
echo "   Backend:  http://localhost:3000"
echo ""
echo "🔍 Pour voir les logs en temps réel:"
echo "   Backend:  cd backend && docker-compose logs -f"
echo "   Frontend: cd frontend && docker-compose logs -f"