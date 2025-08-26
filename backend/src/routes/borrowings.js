const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const authenticateApiKey = require('../middleware/auth_api');
const { asyncHandler } = require('../middleware/errorHandler');
const BorrowingsService = require('../services/borrowingsService');
const {
    validateCreateBorrowing,
    validateUpdateBorrowing,
    validateHistoryFilters,
    validateOverdueThreshold
} = require('../middleware/borrowingValidator');

// GET - Emprunts par membre
router.get('/ByMember/:id', authenticateToken, asyncHandler(async (req, res) => {
    const result = await BorrowingsService.getBorrowingsByMember(req.params.id);
    res.success(result, 'Emprunts du membre recuperes avec succes');
}));
// GET - Emprunts par jeu
router.get('/ByGame/:id', authenticateToken, asyncHandler(async (req, res) => {
    const result = await BorrowingsService.getBorrowingsByGame(req.params.id);
    res.success(result, 'Emprunts du jeu recuperes avec succes');
}));
// GET - Emprunts en cours avec details
router.get('/CurrentBorrowings/', authenticateApiKey, asyncHandler(async (req, res) => {
    const result = await BorrowingsService.getCurrentBorrowings();
    res.success(result, 'Emprunts en cours recuperes avec succes');
}));
// GET - Statistiques d'emprunts par saison
router.get('/TotalBorrowings/:id', authenticateToken, asyncHandler(async (req, res) => {
    const result = await BorrowingsService.getTotalBorrowingsBySeason(req.params.id);
    res.success(result, 'Statistiques d\'emprunts recuperees avec succes');
}));
// GET - Statistiques de jeux par saison
router.get('/TotalGames/:id', authenticateToken, asyncHandler(async (req, res) => {
    const result = await BorrowingsService.getTotalGamesBorrowingsBySeason(req.params.id);
    res.success(result, 'Statistiques de jeux recuperees avec succes');
}));

// GET - Historique complet avec filtres
router.get('/History', authenticateToken, asyncHandler(async (req, res) => {
    const validation = validateHistoryFilters(req.query);
    if (!validation.isValid) {
        return res.validationError(validation.errors);
    }
    
    const result = await BorrowingsService.getBorrowingsHistory(req.query);
    res.success(result, 'Historique des emprunts recupere avec succes');
}));

// GET - Statistiques rapides
router.get('/Stats', authenticateToken, asyncHandler(async (req, res) => {
    const result = await BorrowingsService.getBorrowingStats();
    res.success(result, 'Statistiques des emprunts recuperees avec succes');
}));

// GET - Emprunts en retard
router.get('/Overdue', authenticateToken, asyncHandler(async (req, res) => {
    const validation = validateOverdueThreshold(req.query.threshold);
    if (!validation.isValid) {
        return res.validationError(validation.errors);
    }
    
    const result = await BorrowingsService.getOverdueBorrowings(validation.value);
    res.success(result, 'Emprunts en retard recuperes avec succes');
}));
// POST - Creer un nouvel emprunt
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
    // Valider les donnees d'entree
    const validation = validateCreateBorrowing(req.body);
    if (!validation.isValid) {
        return res.validationError(validation.errors);
    }
    
    const result = await BorrowingsService.createBorrowing(req.body);
    res.success(result, 'Emprunt cree avec succes');
}));
// PUT - Mettre a jour un emprunt (principalement pour les retours)
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const borrowingId = req.params.id;
    
    // Valider les donnees d'entree
    const validation = validateUpdateBorrowing(req.body);
    if (!validation.isValid) {
        return res.validationError(validation.errors);
    }
    
    // Verifier que l'emprunt existe
    const exists = await BorrowingsService.borrowingExists(borrowingId);
    if (!exists) {
        return res.notFound('Emprunt non trouve');
    }
    
    const result = await BorrowingsService.updateBorrowing(borrowingId, req.body);
    res.success(result, 'Emprunt mis a jour avec succes');
}));

// DELETE - Supprimer un emprunt
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const borrowingId = req.params.id;
    
    // Verifier que l'emprunt existe
    const exists = await BorrowingsService.borrowingExists(borrowingId);
    if (!exists) {
        return res.notFound('Emprunt non trouve');
    }
    
    const result = await BorrowingsService.deleteBorrowing(borrowingId);
    res.success(result, 'Emprunt supprime avec succes');
}));

module.exports = router;