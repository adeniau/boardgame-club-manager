const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const authenticateApiKey = require('../middleware/auth_api');
const { asyncHandler } = require('../middleware/errorHandler');
const SeasonsService = require('../services/seasonsService');
const {
    validateCreateSeason,
    validateUpdateSeason,
    validateAnalyticsFilters,
    validateSeasonId
} = require('../middleware/seasonValidator');

// GET - Toutes les saisons avec comptage des adhesions
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
    const result = await SeasonsService.getAllSeasons();
    res.success(result, 'Saisons recuperees avec succes');
}));

// GET - Saison courante
router.get('/current', authenticateApiKey, asyncHandler(async (req, res) => {
    const result = await SeasonsService.getCurrentSeason();
    if (!result) {
        return res.notFound('Aucune saison courante definie');
    }
    res.success(result, 'Saison courante recuperee avec succes');
}));

// GET - Saison par ID avec details
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const validation = validateSeasonId(req.params.id);
    if (!validation.isValid) {
        return res.validationError(validation.errors);
    }
    
    const result = await SeasonsService.getSeasonById(validation.value);
    if (!result) {
        return res.notFound('Saison non trouvee');
    }
    
    res.success(result, 'Saison recuperee avec succes');
}));

// GET - Statistiques d'une saison
router.get('/:id/stats', authenticateToken, asyncHandler(async (req, res) => {
    const validation = validateSeasonId(req.params.id);
    if (!validation.isValid) {
        return res.validationError(validation.errors);
    }
    
    // Verifier que la saison existe
    const seasonExists = await SeasonsService.seasonExists(validation.value);
    if (!seasonExists) {
        return res.notFound('Saison non trouvee');
    }
    
    const result = await SeasonsService.getSeasonStats(validation.value);
    res.success(result, 'Statistiques de la saison recuperees avec succes');
}));

// GET - Analyses avancees d'une saison
router.get('/:id/analytics', authenticateToken, asyncHandler(async (req, res) => {
    const idValidation = validateSeasonId(req.params.id);
    if (!idValidation.isValid) {
        return res.validationError(idValidation.errors);
    }
    
    // Verifier que la saison existe
    const seasonExists = await SeasonsService.seasonExists(idValidation.value);
    if (!seasonExists) {
        return res.notFound('Saison non trouvee');
    }
    
    const result = await SeasonsService.getSeasonAnalytics(idValidation.value);
    res.success(result, 'Analyses de la saison recuperees avec succes');
}));

// GET - Adhesions d'une saison
router.get('/:id/memberships', authenticateToken, asyncHandler(async (req, res) => {
    const validation = validateSeasonId(req.params.id);
    if (!validation.isValid) {
        return res.validationError(validation.errors);
    }
    
    // Verifier que la saison existe
    const seasonExists = await SeasonsService.seasonExists(validation.value);
    if (!seasonExists) {
        return res.notFound('Saison non trouvee');
    }
    
    const result = await SeasonsService.getSeasonMemberships(validation.value);
    res.success(result, 'Adhesions de la saison recuperees avec succes');
}));

// GET - Emprunts d'une saison
router.get('/:id/borrowings', authenticateToken, asyncHandler(async (req, res) => {
    const validation = validateSeasonId(req.params.id);
    if (!validation.isValid) {
        return res.validationError(validation.errors);
    }
    
    // Verifier que la saison existe
    const seasonExists = await SeasonsService.seasonExists(validation.value);
    if (!seasonExists) {
        return res.notFound('Saison non trouvee');
    }
    
    const result = await SeasonsService.getSeasonBorrowings(validation.value);
    res.success(result, 'Emprunts de la saison recuperes avec succes');
}));

// POST - Creer une nouvelle saison
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
    // Valider les donnees d'entree
    const validation = validateCreateSeason(req.body);
    if (!validation.isValid) {
        return res.validationError(validation.errors);
    }
    
    const result = await SeasonsService.createSeason(validation.value);
    res.success(result, 'Saison creee avec succes');
}));

// PUT - Mettre a jour une saison
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const idValidation = validateSeasonId(req.params.id);
    if (!idValidation.isValid) {
        return res.validationError(idValidation.errors);
    }
    
    const dataValidation = validateUpdateSeason(req.body);
    if (!dataValidation.isValid) {
        return res.validationError(dataValidation.errors);
    }
    
    // Verifier que la saison existe
    const seasonExists = await SeasonsService.seasonExists(idValidation.value);
    if (!seasonExists) {
        return res.notFound('Saison non trouvee');
    }
    
    const result = await SeasonsService.updateSeason(idValidation.value, dataValidation.value);
    res.success(result, 'Saison mise a jour avec succes');
}));

// PUT - Definir une saison comme courante
router.put('/:id/set-current', authenticateToken, asyncHandler(async (req, res) => {
    const validation = validateSeasonId(req.params.id);
    if (!validation.isValid) {
        return res.validationError(validation.errors);
    }
    
    // Verifier que la saison existe
    const seasonExists = await SeasonsService.seasonExists(validation.value);
    if (!seasonExists) {
        return res.notFound('Saison non trouvee');
    }
    
    const result = await SeasonsService.setCurrentSeason(validation.value);
    res.success(result, 'Saison definie comme courante avec succes');
}));

// POST - Archiver une saison
router.post('/:id/archive', authenticateToken, asyncHandler(async (req, res) => {
    const validation = validateSeasonId(req.params.id);
    if (!validation.isValid) {
        return res.validationError(validation.errors);
    }
    
    // Verifier que la saison existe
    const seasonExists = await SeasonsService.seasonExists(validation.value);
    if (!seasonExists) {
        return res.notFound('Saison non trouvee');
    }
    
    const result = await SeasonsService.archiveSeason(validation.value);
    res.success(result, 'Saison archivee avec succes');
}));

// DELETE - Supprimer une saison
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const validation = validateSeasonId(req.params.id);
    if (!validation.isValid) {
        return res.validationError(validation.errors);
    }
    
    // Verifier que la saison existe
    const seasonExists = await SeasonsService.seasonExists(validation.value);
    if (!seasonExists) {
        return res.notFound('Saison non trouvee');
    }
    
    const result = await SeasonsService.deleteSeason(validation.value);
    res.success(result, 'Saison supprimee avec succes');
}));

module.exports = router;