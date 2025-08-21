const responseHelpers = (req, res, next) => {
    // Success response
    res.success = (data, message = 'Succès') => {
        res.json({
            success: true,
            message,
            data
        });
    };

    // Error response
    res.error = (message = 'Erreur', statusCode = 500, details = null) => {
        res.status(statusCode).json({
            success: false,
            message,
            ...(details && { details })
        });
    };

    // Not found response
    res.notFound = (message = 'Ressource non trouvée') => {
        res.status(404).json({
            success: false,
            message
        });
    };

    // Validation error response
    res.validationError = (errors) => {
        res.status(400).json({
            success: false,
            message: 'Erreur de validation',
            errors
        });
    };

    // Unauthorized response
    res.unauthorized = (message = 'Non autorisé') => {
        res.status(401).json({
            success: false,
            message
        });
    };

    // Forbidden response
    res.forbidden = (message = 'Accès interdit') => {
        res.status(403).json({
            success: false,
            message
        });
    };

    next();
};

module.exports = responseHelpers;