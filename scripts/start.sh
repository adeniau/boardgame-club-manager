#!/bin/bash

# Script de démarrage pour Board Game Club Manager
# Usage: ./start.sh [backend|frontend|all|stop]

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction d'affichage
log() {
    echo -e "${GREEN}[BGC]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[BGC WARN]${NC} $1"
}

error() {
    echo -e "${RED}[BGC ERROR]${NC} $1"
}

info() {
    echo -e "${BLUE}[BGC INFO]${NC} $1"
}

# Vérifier que Docker est disponible
check_docker() {
    if ! command -v docker &> /dev/null; then
        error "Docker n'est pas installé ou n'est pas dans le PATH"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose n'est pas installé ou n'est pas dans le PATH"
        exit 1
    fi
}

# Démarrer le backend
start_backend() {
    log "Démarrage du backend..."
    cd backend
    
    if docker-compose ps | grep -q "Up"; then
        warn "Le backend semble déjà démarré"
    else
        docker-compose up -d
        log "Backend démarré sur http://localhost:3000"
    fi
    
    # Attendre que l'API soit prête
    info "Vérification de l'API..."
    sleep 5
    
    if curl -s http://localhost:3000 > /dev/null; then
        log "✅ API backend prête"
    else
        error "❌ API backend non accessible"
        docker-compose logs app
    fi
    
    cd ..
}

# Démarrer le frontend
start_frontend() {
    log "Démarrage du frontend..."
    cd frontend
    
    if docker-compose ps | grep -q "Up"; then
        warn "Le frontend semble déjà démarré"
    else
        docker-compose up --build -d
        log "Frontend démarré sur http://localhost:3001"
    fi
    
    # Attendre que le frontend soit prêt
    info "Vérification du frontend..."
    sleep 10
    
    if curl -s http://localhost:3001/health > /dev/null; then
        log "✅ Frontend prêt"
    else
        error "❌ Frontend non accessible"
        docker-compose logs frontend
    fi
    
    cd ..
}

# Arrêter tous les services
stop_all() {
    log "Arrêt de tous les services..."
    
    cd frontend
    if docker-compose ps | grep -q "Up"; then
        docker-compose down
        log "Frontend arrêté"
    fi
    cd ..
    
    cd backend
    if docker-compose ps | grep -q "Up"; then
        docker-compose down
        log "Backend arrêté"
    fi
    cd ..
    
    log "Tous les services sont arrêtés"
}

# Afficher le statut
show_status() {
    log "État des services:"
    
    echo
    info "Backend (API + Base de données):"
    cd backend
    docker-compose ps
    cd ..
    
    echo
    info "Frontend (Interface utilisateur):"
    cd frontend
    docker-compose ps
    cd ..
    
    echo
    info "URLs disponibles:"
    echo "  - Frontend: http://localhost:3001"
    echo "  - Backend:  http://localhost:3000"
}

# Menu principal
main() {
    check_docker
    
    case "${1:-all}" in
        "backend")
            start_backend
            ;;
        "frontend")
            start_frontend
            ;;
        "all")
            start_backend
            start_frontend
            echo
            log "🎉 Board Game Club Manager démarré avec succès!"
            info "Accédez à l'application sur http://localhost:3001"
            ;;
        "stop")
            stop_all
            ;;
        "status")
            show_status
            ;;
        "restart")
            stop_all
            sleep 2
            start_backend
            start_frontend
            ;;
        *)
            echo "Usage: $0 [backend|frontend|all|stop|status|restart]"
            echo
            echo "Commandes disponibles:"
            echo "  backend   - Démarrer uniquement le backend"
            echo "  frontend  - Démarrer uniquement le frontend"
            echo "  all       - Démarrer backend et frontend (défaut)"
            echo "  stop      - Arrêter tous les services"
            echo "  status    - Afficher l'état des services"
            echo "  restart   - Redémarrer tous les services"
            exit 1
            ;;
    esac
}

# Exécuter le script
main "$@"