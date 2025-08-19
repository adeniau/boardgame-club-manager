# Multi-stage build pour optimiser la taille de l'image

# Stage 1: Build
FROM node:18-alpine AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances (toutes pour le build)
RUN npm install

# Copier le code source
COPY . .

# Variables d'environnement pour le build
ARG VITE_API_URL=http://localhost:3000
ARG VITE_API_KEY=your-secret-key
ARG VITE_APP_NAME="Board Game Club Manager"

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_KEY=$VITE_API_KEY
ENV VITE_APP_NAME=$VITE_APP_NAME

# Build de l'application
RUN npm run build

# Stage 2: Production avec Nginx
FROM nginx:1.25-alpine AS production

# Installer les dépendances pour les headers de sécurité
RUN apk add --no-cache openssl

# Copier la configuration Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copier les fichiers buildés depuis le stage précédent
COPY --from=builder /app/dist /usr/share/nginx/html

# Copier le placeholder directement dans nginx html
COPY public/placeholder-game.jpg /usr/share/nginx/html/placeholder-game.jpg
RUN chmod 644 /usr/share/nginx/html/placeholder-game.jpg

# Utiliser l'utilisateur nginx existant (pas besoin de créer)
# Créer les répertoires nécessaires et ajuster les permissions
RUN mkdir -p /var/cache/nginx/client_temp && \
    mkdir -p /var/cache/nginx/proxy_temp && \
    mkdir -p /var/cache/nginx/fastcgi_temp && \
    mkdir -p /var/cache/nginx/uwsgi_temp && \
    mkdir -p /var/cache/nginx/scgi_temp

# Exposer le port
EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Commande de démarrage
CMD ["nginx", "-g", "daemon off;"]