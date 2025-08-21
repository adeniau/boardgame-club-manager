const fs = require('fs');
const path = require('path');
const { IMAGES_DIR } = require('../config/constants');

class ImageService {
    
    /**
     * Construire l'URL complète de l'image
     */
    static buildImageUrl(req, filename) {
        if (!filename) return '';
        return `${req.protocol}://${req.get('host')}/${IMAGES_DIR}/${filename}`;
    }

    /**
     * Construire le chemin relatif de l'image
     */
    static buildImagePath(filename) {
        if (!filename) return '';
        return `/${IMAGES_DIR}/${filename}`;
    }

    /**
     * Extraire le nom de fichier depuis une URL ou un chemin
     */
    static extractFilename(imagePath) {
        if (!imagePath) return null;
        
        // Si c'est déjà juste un nom de fichier
        if (!imagePath.includes('/')) return imagePath;
        
        // Extraire depuis une URL ou un chemin
        const parts = imagePath.split('/');
        return parts[parts.length - 1];
    }

    /**
     * Supprimer un fichier image
     */
    static async deleteImage(imagePath) {
        try {
            if (!imagePath) return { success: true };
            
            const filename = this.extractFilename(imagePath);
            if (!filename) return { success: true };
            
            const localFilePath = path.join(IMAGES_DIR, filename);
            
            // Vérifier si le fichier existe
            if (!fs.existsSync(localFilePath)) {
                return { success: true, message: 'File does not exist' };
            }
            
            // Supprimer le fichier
            await fs.promises.unlink(localFilePath);
            
            return { success: true };
        } catch (error) {
            console.error('Error deleting image:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Valider le type de fichier
     */
    static validateFileType(file) {
        const { ALLOWED_IMAGE_TYPES } = require('../config/constants');
        return ALLOWED_IMAGE_TYPES.includes(file.mimetype);
    }

    /**
     * Valider la taille du fichier
     */
    static validateFileSize(file) {
        const { MAX_FILE_SIZE } = require('../config/constants');
        return file.size <= MAX_FILE_SIZE;
    }

    /**
     * Valider un fichier uploadé
     */
    static validateFile(file) {
        const errors = [];
        
        if (!this.validateFileType(file)) {
            errors.push('Type de fichier non autorisé');
        }
        
        if (!this.validateFileSize(file)) {
            errors.push('Fichier trop volumineux (max 5MB)');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Traiter l'upload d'une image avec suppression de l'ancienne
     */
    static async handleImageUpdate(req, currentImagePath) {
        let result = {
            imagePath: currentImagePath,
            hasChanged: false,
            deleted: false
        };

        // Si un nouveau fichier est uploadé
        if (req.file) {
            // Valider le nouveau fichier
            const validation = this.validateFile(req.file);
            if (!validation.isValid) {
                throw new Error(validation.errors.join(', '));
            }

            // Supprimer l'ancienne image
            if (currentImagePath) {
                await this.deleteImage(currentImagePath);
            }

            result.imagePath = this.buildImagePath(req.file.filename);
            result.hasChanged = true;
        }
        // Si demande de suppression d'image
        else if (req.body.removeImage === 'true') {
            if (currentImagePath) {
                await this.deleteImage(currentImagePath);
            }
            result.imagePath = '';
            result.hasChanged = true;
            result.deleted = true;
        }

        return result;
    }
}

module.exports = ImageService;