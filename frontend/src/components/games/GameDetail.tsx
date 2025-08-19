import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Game } from '../../types/games';
import { GamesService } from '../../services/gamesService';

export default function GameDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (id) {
      loadGame(parseInt(id));
    }
  }, [id]);

  const loadGame = async (gameId: number) => {
    try {
      setLoading(true);
      setError('');
      const gameData = await GamesService.getGameById(gameId);
      setGame(gameData);
    } catch (err) {
      setError('Erreur lors du chargement du jeu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (game) {
      navigate(`/games/${game.id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!game) return;

    if (game.available === 0 || game.available === '0') {
      alert('Impossible de supprimer un jeu emprunté');
      return;
    }

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le jeu "${game.name}" ?`)) {
      try {
        await GamesService.deleteGame(game.id);
        navigate('/games');
      } catch (err) {
        alert('Erreur lors de la suppression du jeu');
        console.error(err);
      }
    }
  };

  const handleBorrow = () => {
    // TODO: Implémenter la fonctionnalité d'emprunt
    alert('Fonctionnalité d\'emprunt à implémenter dans la Phase 5');
  };

  const handleReturn = () => {
    // TODO: Implémenter la fonctionnalité de retour
    alert('Fonctionnalité de retour à implémenter dans la Phase 5');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-gray-600">Chargement du jeu...</span>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="flex items-center justify-center mb-4">
            <svg className="h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-800 mb-2">Jeu non trouvé</h3>
          <p className="text-red-700 mb-4">{error || 'Ce jeu n\'existe pas ou a été supprimé.'}</p>
          <Link
            to="/games"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  const isAvailable = game.available === 1 || game.available === '1';
  const imageUrl = GamesService.getImageUrl(game.picture);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link
              to="/games"
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Jeux
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">{game.name}</span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="md:flex">
          {/* Image */}
          <div className="md:w-1/3">
            <div className="aspect-w-3 aspect-h-2 md:aspect-w-1 md:aspect-h-1">
              <img
                src={imageUrl}
                alt={`Couverture du jeu ${game.name}`}
                className="w-full h-64 md:h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-game.jpg';
                }}
              />
            </div>
          </div>

          {/* Informations */}
          <div className="md:w-2/3 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{game.name}</h1>
                
                {/* Badge de disponibilité */}
                <div className="mb-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      isAvailable
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full mr-2 ${
                        isAvailable ? 'bg-green-400' : 'bg-red-400'
                      }`}
                      aria-hidden="true"
                    />
                    {isAvailable ? 'Disponible' : 'Emprunté'}
                  </span>
                </div>

                {/* Informations du jeu */}
                <div className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">ID du jeu</dt>
                    <dd className="text-sm text-gray-900">#{game.id}</dd>
                  </div>
                  
                  {game.created_at && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Date d'ajout</dt>
                      <dd className="text-sm text-gray-900">
                        {new Date(game.created_at).toLocaleDateString('fr-FR')}
                      </dd>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap gap-3">
              {isAvailable ? (
                <button
                  onClick={handleBorrow}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Emprunter
                </button>
              ) : (
                <button
                  onClick={handleReturn}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  Marquer comme retourné
                </button>
              )}

              <button
                onClick={handleEdit}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Modifier
              </button>

              <button
                onClick={handleDelete}
                disabled={!isAvailable}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                title={!isAvailable ? 'Impossible de supprimer un jeu emprunté' : 'Supprimer le jeu'}
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Supprimer
              </button>
            </div>
          </div>
        </div>

        {/* Historique des emprunts */}
        <div className="border-t border-gray-200 px-6 py-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Historique des emprunts</h2>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p className="text-sm text-gray-500">Historique disponible dans la Phase 5</p>
          </div>
        </div>
      </div>
    </div>
  );
}