/**
 * Module de validation pour les emprunts
 */

/**
 * Valide les donnees pour creer un nouvel emprunt
 */
const validateCreateBorrowing = (data) => {
    const errors = [];
    
    // Validation des champs obligatoires
    if (!data.id_season) {
        errors.push('id_season est obligatoire');
    } else if (!Number.isInteger(parseInt(data.id_season)) || parseInt(data.id_season) <= 0) {
        errors.push('id_season doit etre un entier positif');
    }
    
    if (!data.id_member) {
        errors.push('id_member est obligatoire');
    } else if (!Number.isInteger(parseInt(data.id_member)) || parseInt(data.id_member) <= 0) {
        errors.push('id_member doit etre un entier positif');
    }
    
    if (!data.id_game) {
        errors.push('id_game est obligatoire');
    } else if (!Number.isInteger(parseInt(data.id_game)) || parseInt(data.id_game) <= 0) {
        errors.push('id_game doit etre un entier positif');
    }
    
    if (!data.borrow_date) {
        errors.push('borrow_date est obligatoire');
    } else if (!isValidDate(data.borrow_date)) {
        errors.push('borrow_date doit etre une date valide au format YYYY-MM-DD');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Valide les donnees pour mettre a jour un emprunt (retour)
 */
const validateUpdateBorrowing = (data) => {
    const errors = [];
    
    // return_date est optionnel mais si present doit etre valide
    if (data.return_date && !isValidDate(data.return_date)) {
        errors.push('return_date doit etre une date valide au format YYYY-MM-DD');
    }
    
    // comment est optionnel mais si present doit etre une chaine
    if (data.comment && typeof data.comment !== 'string') {
        errors.push('comment doit etre une chaine de caracteres');
    }
    
    // Au moins un champ doit etre present
    if (!data.return_date && !data.comment) {
        errors.push('Au moins un champ doit etre fourni pour la mise a jour');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Valide les filtres pour l'historique des emprunts
 */
const validateHistoryFilters = (filters) => {
    const errors = [];
    
    // Validation des IDs s'ils sont presents
    if (filters.seasonId && (!Number.isInteger(parseInt(filters.seasonId)) || parseInt(filters.seasonId) <= 0)) {
        errors.push('seasonId doit etre un entier positif');
    }
    
    if (filters.memberId && (!Number.isInteger(parseInt(filters.memberId)) || parseInt(filters.memberId) <= 0)) {
        errors.push('memberId doit etre un entier positif');
    }
    
    if (filters.gameId && (!Number.isInteger(parseInt(filters.gameId)) || parseInt(filters.gameId) <= 0)) {
        errors.push('gameId doit etre un entier positif');
    }
    
    // Validation du statut
    if (filters.status && !['current', 'returned'].includes(filters.status)) {
        errors.push('status doit etre "current" ou "returned"');
    }
    
    // Validation des dates
    if (filters.dateFrom && !isValidDate(filters.dateFrom)) {
        errors.push('dateFrom doit etre une date valide au format YYYY-MM-DD');
    }
    
    if (filters.dateTo && !isValidDate(filters.dateTo)) {
        errors.push('dateTo doit etre une date valide au format YYYY-MM-DD');
    }
    
    // Validation de la limite
    if (filters.limit && (!Number.isInteger(parseInt(filters.limit)) || parseInt(filters.limit) <= 0 || parseInt(filters.limit) > 1000)) {
        errors.push('limit doit etre un entier entre 1 et 1000');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Valide le seuil pour les emprunts en retard
 */
const validateOverdueThreshold = (threshold) => {
    const errors = [];
    
    if (threshold && (!Number.isInteger(parseInt(threshold)) || parseInt(threshold) <= 0 || parseInt(threshold) > 365)) {
        errors.push('threshold doit etre un entier entre 1 et 365 jours');
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        value: threshold ? parseInt(threshold) : 14 // valeur par defaut
    };
};

/**
 * Verifie si une chaine represente une date valide au format YYYY-MM-DD
 */
const isValidDate = (dateString) => {
    if (typeof dateString !== 'string') return false;
    
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) return false;
    
    const date = new Date(dateString + 'T00:00:00.000Z');
    return date instanceof Date && !isNaN(date.getTime()) && date.toISOString().slice(0, 10) === dateString;
};

module.exports = {
    validateCreateBorrowing,
    validateUpdateBorrowing,
    validateHistoryFilters,
    validateOverdueThreshold
};