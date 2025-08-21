const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const authenticateApiKey = require('../middleware/auth_api');
const multer = require('../middleware/multer-config');
const { asyncHandler } = require('../middleware/errorHandler');
const GamesService = require('../services/gamesService');
const ImageService = require('../services/imageService');

// GET
router.get('/Random/', authenticateApiKey, asyncHandler(async (req, res) => {
    const result = await GamesService.getRandomGame();
    res.success(result);
}));
router.get('/', authenticateApiKey, asyncHandler(async (req, res) => {
    const result = await GamesService.getAllGames();
    res.success(result);
}));
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const result = await GamesService.getGameById(req.params.id);
    res.success(result);
}));
router.get('/GamesBorrows/:id', authenticateToken, asyncHandler(async (req, res) => {
    const result = await GamesService.getGamesBorrowsBySeason(req.params.id);
    res.success(result);
}));
router.get('/GameBorrows/:id', authenticateToken, asyncHandler(async (req, res) => {
    const result = await GamesService.getGameBorrows(req.params.id);
    res.success(result);
}));
// POST
router.post('/', authenticateToken, multer, asyncHandler(async (req, res) => {
    const gameData = req.body;
    let imageUrl = '';
    
    if (req.file) {
        const validation = ImageService.validateFile(req.file);
        if (!validation.isValid) {
            return res.validationError(validation.errors);
        }
        imageUrl = ImageService.buildImagePath(req.file.filename);
    }
    
    const result = await GamesService.createGame({
        ...gameData,
        picture: imageUrl
    });
    
    res.success(result, 'Jeu créé avec succès');
}));
router.put('/:id', authenticateToken, multer, asyncHandler(async (req, res) => {
    const gameId = req.params.id;
    const gameData = req.body;
    
    // Vérifier que le jeu existe
    const currentGame = await GamesService.getGameById(gameId);
    if (!currentGame) {
        return res.notFound('Jeu non trouvé');
    }
    
    // Gérer la mise à jour de l'image
    const imageResult = await ImageService.handleImageUpdate(req, currentGame.picture);
    
    let result;
    if (imageResult.hasChanged) {
        result = await GamesService.updateGame(gameId, {
            ...gameData,
            picture: imageResult.imagePath
        });
    } else {
        result = await GamesService.updateGameWithoutPicture(gameId, gameData);
    }
    
    res.success(result, 'Jeu modifié avec succès');
}));
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const gameId = req.params.id;
    
    // Récupérer les informations du jeu avant suppression
    const game = await GamesService.getGameById(gameId);
    if (!game) {
        return res.notFound('Jeu non trouvé');
    }
    
    // Supprimer l'image associée s'il y en a une
    if (game.picture) {
        await ImageService.deleteImage(game.picture);
    }
    
    // Supprimer le jeu de la base de données
    const result = await GamesService.deleteGame(gameId);
    
    res.success(result, 'Jeu supprimé avec succès');
}));

module.exports = router;