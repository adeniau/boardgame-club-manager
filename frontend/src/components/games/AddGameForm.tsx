import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameFormData } from '../../types/games';
import { GamesService } from '../../services/gamesService';

export default function AddGameForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<GameFormData>({
    name: '',
    picture: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Le nom du jeu est obligatoire');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Créer le jeu avec l'image en une seule fois
      await GamesService.createGame({
        name: formData.name.trim(),
      }, formData.picture);

      // Rediriger vers la liste des jeux
      navigate('/games');
    } catch (err) {
      setError('Erreur lors de la création du jeu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, name: e.target.value }));
    if (error) setError('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        setError('L\'image ne doit pas dépasser 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner un fichier image');
        return;
      }

      setFormData(prev => ({ ...prev, picture: file }));
      
      // Créer un aperçu
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      if (error) setError('');
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, picture: undefined }));
    setImagePreview('');
    
    // Reset input file
    const input = document.getElementById('picture') as HTMLInputElement;
    if (input) input.value = '';
  };

  const handleCancel = () => {
    navigate('/games');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ajouter un nouveau jeu</h1>
        <p className="mt-1 text-sm text-gray-600">
          Remplissez les informations du jeu que vous souhaitez ajouter à votre collection.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-6">
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
            disabled={loading}
          />
        </div>

        {/* Image du jeu */}
        <div>
          <label htmlFor="picture" className="block text-sm font-medium text-gray-700 mb-2">
            Image du jeu (optionnel)
          </label>
          
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
            <div className="space-y-1 text-center">
              {imagePreview ? (
                <div className="space-y-3">
                  <img
                    src={imagePreview}
                    alt="Aperçu"
                    className="mx-auto h-32 w-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-sm text-red-600 hover:text-red-800 underline"
                    disabled={loading}
                  >
                    Supprimer l'image
                  </button>
                </div>
              ) : (
                <>
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="picture"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Télécharger une image</span>
                      <input
                        id="picture"
                        name="picture"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                        disabled={loading}
                      />
                    </label>
                    <p className="pl-1">ou glissez-déposez</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, JPEG jusqu'à 5MB</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Annuler
          </button>
          
          <button
            type="submit"
            disabled={loading || !formData.name.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Création...
              </>
            ) : (
              'Créer le jeu'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}