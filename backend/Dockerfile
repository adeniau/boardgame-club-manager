# Utiliser une image de base officielle Node.js
FROM node:22

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Installer git pour cloner le dépôt
RUN apt-get update && apt-get install -y git

# Copier les fichiers package.json et package-lock.json
#COPY package*.json ./

#Cloner le dépôt depuis GitHub
RUN git clone https://github.com/adeniau/boardgame-club-manager.git /app

# Se déplacer dans le répertoire backend/src pour installer les dépendances
WORKDIR /app/backend/src

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers de l'application
#COPY . .

# Exposer le port sur lequel l'application va fonctionner
EXPOSE 3000

# Démarrer l'application
CMD ["node", "server.js"]
