module.exports = {
    // Server configuration
    PORT: process.env.PORT || 3000,
    
    // Security
    BCRYPT_ROUNDS: 10,
    
    // File upload
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    IMAGES_DIR: 'images',
    
    // Database
    DB_CONFIG: {
        host: process.env.DB_HOST || 'db',
        user: process.env.MYSQL_USER || 'bcm_user',
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE || 'BCM',
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true
    },
    
    // JWT
    JWT_SECRET: process.env.RANDOM_TOKEN_SECRET,
    JWT_EXPIRES_IN: '24h',
    
    // API
    API_KEY: process.env.API_KEY,
    
    // HTTP Status Codes
    HTTP_STATUS: {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        CONFLICT: 409,
        INTERNAL_SERVER_ERROR: 500
    },
    
    // Messages
    MESSAGES: {
        SUCCESS: 'Opération réussie',
        ERROR: 'Erreur serveur interne',
        NOT_FOUND: 'Ressource non trouvée',
        UNAUTHORIZED: 'Non autorisé',
        VALIDATION_ERROR: 'Erreur de validation',
        FILE_TOO_LARGE: 'Fichier trop volumineux',
        INVALID_FILE_TYPE: 'Type de fichier non autorisé'
    }
};