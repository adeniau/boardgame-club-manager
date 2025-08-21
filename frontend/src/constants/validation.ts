export const VALIDATION_RULES = {
  // File upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  
  // Form validation
  REQUIRED_FIELDS: {
    GAME_NAME: 'Le nom du jeu est obligatoire',
    MEMBER_NAME: 'Le nom est obligatoire',
    MEMBER_EMAIL: 'L\'email est obligatoire',
  },
  
  // Error messages
  ERRORS: {
    FILE_TOO_LARGE: 'L\'image ne doit pas dépasser 5MB',
    INVALID_FILE_TYPE: 'Veuillez sélectionner un fichier image valide',
    NETWORK_ERROR: 'Erreur de connexion au serveur',
    GENERIC_ERROR: 'Une erreur inattendue est survenue',
    UNAUTHORIZED: 'Vous n\'êtes pas autorisé à effectuer cette action',
    NOT_FOUND: 'Ressource non trouvée',
  },
  
  // Success messages
  SUCCESS: {
    GAME_CREATED: 'Jeu créé avec succès',
    GAME_UPDATED: 'Jeu modifié avec succès',
    GAME_DELETED: 'Jeu supprimé avec succès',
    MEMBER_CREATED: 'Membre créé avec succès',
    MEMBER_UPDATED: 'Membre modifié avec succès',
    MEMBER_DELETED: 'Membre supprimé avec succès',
  }
} as const;