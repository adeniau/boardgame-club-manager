const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const authenticateApiKey = require('../middleware/auth_api');
const multer = require('../middleware/multer-config');
const { asyncHandler } = require('../middleware/errorHandler');
const MembersService = require('../services/membersService');
const ImageService = require('../services/imageService');

// GET
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
    const result = await MembersService.getAllMembers();
    res.success(result);
}));
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const result = await MembersService.getMemberById(req.params.id);
    res.success(result);
}));
router.get('/NewMembers/:id', authenticateToken, asyncHandler(async (req, res) => {
    const result = await MembersService.getNewMembersBySeason(req.params.id);
    res.success(result);
}));
router.get('/MembersBorrows/:id', authenticateToken, asyncHandler(async (req, res) => {
    const result = await MembersService.getMembersBorrowsBySeason(req.params.id);
    res.success(result);
}));
router.get('/MemberBorrows/:id', authenticateToken, asyncHandler(async (req, res) => {
    const result = await MembersService.getMemberBorrows(req.params.id);
    res.success(result);
}));
// POST
router.post('/', authenticateApiKey, multer, asyncHandler(async (req, res) => {
    const memberData = req.body;
    let imageUrl = '';
    
    if (req.file) {
        const validation = ImageService.validateFile(req.file);
        if (!validation.isValid) {
            return res.validationError(validation.errors);
        }
        imageUrl = ImageService.buildImageUrl(req, req.file.filename);
    }
    
    const result = await MembersService.createMember({
        ...memberData,
        picture: imageUrl
    });
    
    res.success(result, 'Membre créé avec succès');
}));
router.put('/:id', authenticateToken, multer, asyncHandler(async (req, res) => {
    const memberId = req.params.id;
    const memberData = req.body;
    
    // Vérifier que le membre existe
    const currentMember = await MembersService.getMemberById(memberId);
    if (!currentMember) {
        return res.notFound('Membre non trouvé');
    }
    
    // Gérer la mise à jour de l'image
    const imageResult = await ImageService.handleImageUpdate(req, currentMember.picture);
    let imageUrl = currentMember.picture; // Conserver l'image actuelle par défaut
    
    if (imageResult.hasChanged) {
        imageUrl = req.file ? ImageService.buildImageUrl(req, req.file.filename) : '';
    }
    
    let result;
    if (imageResult.hasChanged) {
        result = await MembersService.updateMember(memberId, {
            ...memberData,
            picture: imageUrl
        });
    } else {
        result = await MembersService.updateMemberWithoutPicture(memberId, memberData);
    }
    
    res.success(result, 'Membre modifié avec succès');
}));

router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const memberId = req.params.id;
    
    // Récupérer les informations du membre avant suppression
    const member = await MembersService.getMemberById(memberId);
    if (!member) {
        return res.notFound('Membre non trouvé');
    }
    
    // Supprimer l'image associée s'il y en a une
    if (member.picture) {
        await ImageService.deleteImage(member.picture);
    }
    
    // Supprimer le membre de la base de données
    const result = await MembersService.deleteMember(memberId);
    
    res.success(result, 'Membre supprimé avec succès');
}));


module.exports = router;