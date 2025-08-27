/**
 * Validation pour les operations sur les saisons
 */

/**
 * Valider les donnees de creation d'une saison
 */
function validateCreateSeason(data) {
    const errors = [];
    const { name, description, start_date, end_date, set_as_current } = data;
    
    // Nom requis
    if (!name || typeof name !== 'string') {
        errors.push('Le nom de la saison est requis et doit etre une chaine de caracteres');
    } else {
        const trimmedName = name.trim();
        if (trimmedName.length === 0) {
            errors.push('Le nom de la saison ne peut pas etre vide');
        } else if (trimmedName.length > 100) {
            errors.push('Le nom de la saison ne peut pas depasser 100 caracteres');
        }
    }
    
    // Description optionnelle
    if (description !== undefined && description !== null && typeof description !== 'string') {
        errors.push('La description doit etre une chaine de caracteres');
    } else if (description && description.length > 1000) {
        errors.push('La description ne peut pas depasser 1000 caracteres');
    }
    
    // Validation des dates si fournies
    if (start_date !== undefined && start_date !== null) {
        if (typeof start_date !== 'string' || !isValidDateString(start_date)) {
            errors.push('La date de debut doit etre au format YYYY-MM-DD');
        }
    }
    
    if (end_date !== undefined && end_date !== null) {
        if (typeof end_date !== 'string' || !isValidDateString(end_date)) {
            errors.push('La date de fin doit etre au format YYYY-MM-DD');
        }
    }
    
    // Validation de la coherence des dates
    if (start_date && end_date && isValidDateString(start_date) && isValidDateString(end_date)) {
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        
        if (startDate >= endDate) {
            errors.push('La date de debut doit etre anterieure a la date de fin');
        }
    }
    
    // Validation du flag current
    if (set_as_current !== undefined && typeof set_as_current !== 'boolean') {
        errors.push('Le parametre set_as_current doit etre un booleen');
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        value: {
            name: name ? name.trim() : undefined,
            description: description ? description.trim() : undefined,
            start_date,
            end_date,
            set_as_current: Boolean(set_as_current)
        }
    };
}

/**
 * Valider les donnees de mise a jour d'une saison
 */
function validateUpdateSeason(data) {
    const errors = [];
    const { name, description, start_date, end_date } = data;
    
    // Au moins un champ doit etre fourni
    if (!name && !description && !start_date && !end_date) {
        errors.push('Au moins un champ doit etre fourni pour la mise a jour');
    }
    
    // Nom optionnel mais valide si fourni
    if (name !== undefined) {
        if (name === null || typeof name !== 'string') {
            errors.push('Le nom de la saison doit etre une chaine de caracteres');
        } else {
            const trimmedName = name.trim();
            if (trimmedName.length === 0) {
                errors.push('Le nom de la saison ne peut pas etre vide');
            } else if (trimmedName.length > 100) {
                errors.push('Le nom de la saison ne peut pas depasser 100 caracteres');
            }
        }
    }
    
    // Description optionnelle
    if (description !== undefined) {
        if (description !== null && typeof description !== 'string') {
            errors.push('La description doit etre une chaine de caracteres');
        } else if (description && description.length > 1000) {
            errors.push('La description ne peut pas depasser 1000 caracteres');
        }
    }
    
    // Validation des dates si fournies
    if (start_date !== undefined && start_date !== null) {
        if (typeof start_date !== 'string' || !isValidDateString(start_date)) {
            errors.push('La date de debut doit etre au format YYYY-MM-DD');
        }
    }
    
    if (end_date !== undefined && end_date !== null) {
        if (typeof end_date !== 'string' || !isValidDateString(end_date)) {
            errors.push('La date de fin doit etre au format YYYY-MM-DD');
        }
    }
    
    // Validation de la coherence des dates si les deux sont fournies
    if (start_date && end_date && isValidDateString(start_date) && isValidDateString(end_date)) {
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        
        if (startDate >= endDate) {
            errors.push('La date de debut doit etre anterieure a la date de fin');
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        value: {
            name: name !== undefined ? (name ? name.trim() : null) : undefined,
            description: description !== undefined ? (description ? description.trim() : null) : undefined,
            start_date: start_date !== undefined ? start_date : undefined,
            end_date: end_date !== undefined ? end_date : undefined
        }
    };
}

/**
 * Valider les filtres pour les analyses de saisons
 */
function validateAnalyticsFilters(query) {
    const errors = [];
    const { include_archived, date_range } = query;
    
    // Validation du flag include_archived
    if (include_archived !== undefined) {
        if (include_archived !== 'true' && include_archived !== 'false' && include_archived !== '1' && include_archived !== '0') {
            errors.push('Le parametre include_archived doit etre true, false, 1 ou 0');
        }
    }
    
    // Validation de la plage de dates
    if (date_range !== undefined) {
        if (!['current', 'last_year', 'all'].includes(date_range)) {
            errors.push('Le parametre date_range doit etre current, last_year ou all');
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        value: {
            include_archived: include_archived === 'true' || include_archived === '1',
            date_range: date_range || 'current'
        }
    };
}

/**
 * Valider un ID de saison
 */
function validateSeasonId(id) {
    const errors = [];
    
    if (!id) {
        errors.push('ID de saison requis');
    } else if (isNaN(parseInt(id)) || parseInt(id) <= 0) {
        errors.push('ID de saison invalide');
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        value: parseInt(id)
    };
}

/**
 * Utilitaire pour valider une chaine de date
 */
function isValidDateString(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) {
        return false;
    }
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
}

module.exports = {
    validateCreateSeason,
    validateUpdateSeason,
    validateAnalyticsFilters,
    validateSeasonId
};