const errorHandler = (err, req, res, next) => {
    console.error(err);
    
    // Database errors
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Cette entrée existe déjà' });
    }
    
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ message: 'Référence invalide' });
    }
    
    // Validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: err.message });
    }
    
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Token invalide' });
    }
    
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expiré' });
    }
    
    // File upload errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Fichier trop volumineux' });
    }
    
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ message: 'Type de fichier non autorisé' });
    }
    
    // Default error
    res.status(500).json({ message: 'Erreur serveur interne' });
};

// Wrapper pour les fonctions async des routes
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, asyncHandler };