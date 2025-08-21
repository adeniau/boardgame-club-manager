import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Game } from '../../types/games';
import { GamesService } from '../../services/gamesService';
import { useGameForm } from '../../hooks/useGameForm';
import { useImageUpload } from '../../hooks/useImageUpload';
import ImageUpload from '../ui/ImageUpload';
import ErrorAlert from '../ui/ErrorAlert';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function EditGameForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);

  const handleSubmitGame = async (formData: any, file?: File, removeImage?: boolean) => {
    if (!game) return;
    
    await GamesService.updateGame(game.id, {
      name: formData.name.trim(),
    }, game, file, removeImage);
    
    navigate(`/games/${game.id}`);
  };
  
  const { formData, loading: saving, error, handleSubmit, handleNameChange, handleCancel, updateFormData } = useGameForm({
    onSubmit: handleSubmitGame,
    onCancel: () => navigate(`/games/${game?.id || ''}`),
    initialData: game || {}
  });
  
  const imageUpload = useImageUpload({
    onError: (error) => console.error('Image error:', error)
  });
  
  useEffect(() => {
    if (id) {
      loadGame(parseInt(id));
    }
  }, [id]);

  const loadGame = async (gameId: number) => {
    try {
      setLoading(true);
      const gameData = await GamesService.getGameById(gameId);
      setGame(gameData);
      
      if (gameData.picture) {
        imageUpload.setPreview(GamesService.getImageUrl(gameData.picture));
      }
    } catch (err) {
      console.error('Erreur lors du chargement du jeu:', err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    handleSubmit(e, imageUpload.file, imageUpload.removeImage);
  };

  const handleImageRemove = () => {
    imageUpload.handleRemoveImage(game?.picture ? GamesService.getImageUrl(game.picture) : '');
  };

  // Initialiser le formulaire quand le jeu est chargé
  useEffect(() => {
    if (game && formData.name !== game.name) {
      updateFormData({ name: game.name });
    }
  }, [game, updateFormData]);

  if (loading) {
    return <LoadingSpinner message="Chargement du jeu..." />;
  }

  if (!game) {
    return (
      <div className="text-center py-12">
        <ErrorAlert message="Jeu non trouvé" className="max-w-md mx-auto" />
      </div>
    );
  }


  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Modifier le jeu</h1>
        <p className="mt-1 text-sm text-gray-600">
          Modifiez les informations du jeu "{game.name}".
        </p>
      </div>

      <form onSubmit={onSubmit} className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-6">
        {/* Nom du jeu */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Nom du jeu <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={handleNameChange}
            required
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Ex: Catan, Azul, Wingspan..."
            disabled={saving}
          />
        </div>

        {/* Image du jeu */}
        <ImageUpload
          preview={imageUpload.preview}
          file={imageUpload.file}
          removeImage={imageUpload.removeImage}
          onChange={imageUpload.handleFileChange}
          onRemove={handleImageRemove}
          onError={(error) => console.error('Image upload error:', error)}
          disabled={saving}
          label="Image du jeu (optionnel)"
        />

        {/* Message d'erreur */}
        <ErrorAlert message={error} />

        {/* Boutons d'action */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            disabled={saving}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Annuler
          </button>
          
          <button
            type="submit"
            disabled={saving || !formData.name.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Modification...
              </>
            ) : (
              'Sauvegarder'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}