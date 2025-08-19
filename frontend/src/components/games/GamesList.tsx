import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Game, GameFilters } from '../../types/games';
import { GamesService } from '../../services/gamesService';
import GameCard from './GameCard';

export default function GamesList() {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filters, setFilters] = useState<GameFilters>({
    search: '',
    availability: 'all',
  });

  useEffect(() => {
    loadGames();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [games, filters]);

  const loadGames = async () => {
    try {
      setLoading(true);
      setError('');
      const gamesData = await GamesService.getAllGames();
      setGames(gamesData);
    } catch (err) {
      setError('Erreur lors du chargement des jeux');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = games;

    // Filtre par recherche
    if (filters.search) {
      filtered = filtered.filter(game =>
        game.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Filtre par disponibilité
    if (filters.availability !== 'all') {
      filtered = filtered.filter(game => {
        if (filters.availability === 'available') {
          return game.available === 1;
        } else if (filters.availability === 'borrowed') {
          return game.available === 0;
        }
        return true;
      });
    }

    setFilteredGames(filtered);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleAvailabilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ 
      ...prev, 
      availability: e.target.value as GameFilters['availability'] 
    }));
  };

  const handleEditGame = (game: Game) => {
    navigate(`/games/${game.id}/edit`);
  };

  const handleDeleteGame = async (game: Game) => {
    if (game.available === 0) {
      alert('Impossible de supprimer un jeu emprunté');
      return;
    }

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le jeu "${game.name}" ?`)) {
      try {
        await GamesService.deleteGame(game.id);
        await loadGames(); // Recharger la liste
      } catch (err) {
        alert('Erreur lors de la suppression du jeu');
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-gray-600">Chargement des jeux...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
          <div className="flex items-center justify-center mb-2">
            <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-700 font-medium">{error}</p>
          <button
            onClick={loadGames}
            className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header avec filtres */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Jeux</h1>
            <p className="mt-1 text-sm text-gray-600">
              {filteredGames.length} jeu{filteredGames.length > 1 ? 'x' : ''} 
              {filters.search || filters.availability !== 'all' ? ' (filtré' + (filteredGames.length > 1 ? 's' : '') + ')' : ''}
            </p>
          </div>
          
          <Link
            to="/games/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter un jeu
          </Link>
        </div>

        {/* Filtres */}
        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="sr-only">
              Rechercher un jeu
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="search"
                type="text"
                placeholder="Rechercher par nom..."
                value={filters.search}
                onChange={handleSearchChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="sm:w-48">
            <label htmlFor="availability" className="sr-only">
              Filtrer par disponibilité
            </label>
            <select
              id="availability"
              value={filters.availability}
              onChange={handleAvailabilityChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">Tous les jeux</option>
              <option value="available">Disponibles</option>
              <option value="borrowed">Empruntés</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des jeux */}
      {filteredGames.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {games.length === 0 ? 'Aucun jeu' : 'Aucun jeu trouvé'}
          </h3>
          <p className="mt-2 text-gray-500">
            {games.length === 0 
              ? 'Commencez par ajouter votre premier jeu.' 
              : 'Essayez de modifier vos critères de recherche.'
            }
          </p>
          {games.length === 0 && (
            <div className="mt-6">
              <Link
                to="/games/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Ajouter le premier jeu
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onEdit={handleEditGame}
              onDelete={handleDeleteGame}
            />
          ))}
        </div>
      )}
    </div>
  );
}