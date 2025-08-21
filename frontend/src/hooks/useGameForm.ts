import { useState } from 'react';
import { Game, GameFormData } from '../types/games';

interface UseGameFormOptions {
  onSubmit: (data: GameFormData, file?: File, removeImage?: boolean) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<Game>;
}

export const useGameForm = (options: UseGameFormOptions) => {
  const { onSubmit, onCancel, initialData } = options;
  
  const [formData, setFormData] = useState<GameFormData>({
    name: initialData?.name || '',
    picture: undefined,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent, file?: File, removeImage?: boolean) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Le nom du jeu est obligatoire');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await onSubmit({
        name: formData.name.trim(),
        picture: file
      }, file, removeImage);
      
    } catch (err) {
      setError('Une erreur est survenue lors de l\'opération');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, name: e.target.value }));
    if (error) setError('');
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
  };

  const clearError = () => setError('');

  const updateFormData = (data: Partial<GameFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  return {
    formData,
    loading,
    error,
    handleSubmit,
    handleNameChange,
    handleCancel,
    clearError,
    setError,
    updateFormData
  };
};