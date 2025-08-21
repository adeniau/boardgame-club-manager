import { useState } from 'react';

interface UseImageUploadOptions {
  maxSize?: number; // en bytes, défaut 5MB
  allowedTypes?: string[];
  onError?: (error: string) => void;
}

interface ImageUploadState {
  preview: string;
  file: File | undefined;
  removeImage: boolean;
}

export const useImageUpload = (options: UseImageUploadOptions = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    onError
  } = options;

  const [imageState, setImageState] = useState<ImageUploadState>({
    preview: '',
    file: undefined,
    removeImage: false
  });

  const setPreview = (preview: string) => {
    setImageState(prev => ({ ...prev, preview }));
  };

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    if (file.size > maxSize) {
      return { isValid: false, error: 'L\'image ne doit pas dépasser 5MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Veuillez sélectionner un fichier image valide' };
    }

    return { isValid: true };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.isValid) {
      if (onError) onError(validation.error!);
      return;
    }

    setImageState(prev => ({
      ...prev,
      file,
      removeImage: false
    }));

    // Créer un aperçu
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageState(prev => ({
        ...prev,
        preview: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (originalImageUrl?: string) => {
    if (imageState.removeImage) {
      // Annuler la suppression
      setImageState(prev => ({
        ...prev,
        removeImage: false,
        preview: originalImageUrl || ''
      }));
    } else if (imageState.file) {
      // Annuler la sélection de nouveau fichier
      setImageState(prev => ({
        ...prev,
        file: undefined,
        preview: originalImageUrl || ''
      }));
      
      // Réinitialiser l'input file
      const input = document.getElementById('picture') as HTMLInputElement;
      if (input) input.value = '';
    } else {
      // Marquer pour suppression
      setImageState(prev => ({
        ...prev,
        removeImage: true,
        preview: ''
      }));
    }
  };

  const reset = (initialPreview = '') => {
    setImageState({
      preview: initialPreview,
      file: undefined,
      removeImage: false
    });
  };

  return {
    preview: imageState.preview,
    file: imageState.file,
    removeImage: imageState.removeImage,
    handleFileChange,
    handleRemoveImage,
    setPreview,
    reset,
    hasNewFile: !!imageState.file,
    hasChanges: !!imageState.file || imageState.removeImage
  };
};