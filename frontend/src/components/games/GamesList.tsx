import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Game, GameFilters } from '../../types/games';
import { GamesService } from '../../services/gamesService';
import { BorrowingsService } from '../../services/borrowingsService';
import { MembersService } from '../../services/membersService';
import { SeasonsService } from '../../services/seasonsService';
import { Member } from '../../types/members';
import { CurrentBorrowing } from '../../types/borrowings';
import GameCard from './GameCard';

// Modal d'emprunt rapide
function QuickBorrowModal({ 
  game, 
  members, 
  currentSeason, 
  onConfirm, 
  onCancel 
}: {
  game: Game;
  members: Member[];
  currentSeason: any;
  onConfirm: (memberId: number, borrowDate: string) => void;
  onCancel: () => void;
}) {
  const [selectedMemberId, setSelectedMemberId] = useState<number>(0);
  const [borrowDate, setBorrowDate] = useState<string>(new Date().toISOString().split('T')[0] || '');
  const [memberSearch, setMemberSearch] = useState<string>('');

  const filteredMembers = members.filter(member => 
    `${member.firstname || ''} ${member.name || ''}`.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMemberId > 0 && borrowDate) {
      onConfirm(selectedMemberId, borrowDate);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Emprunt rapide</h3>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Jeu: <span className="font-medium">{game.name}</span>
            </p>
            {currentSeason && (
              <p className="text-sm text-gray-600">
                Saison: <span className="font-medium">{currentSeason.year}</span>
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Membre
              </label>
              <input
                type="text"
                placeholder="Rechercher un membre..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2"
              />
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value={0}>Sélectionnez un membre</option>
                {filteredMembers.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.firstname} {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date d'emprunt
              </label>
              <input
                type="date"
                value={borrowDate}
                onChange={(e) => setBorrowDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={selectedMemberId === 0 || !borrowDate}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Emprunter
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Modal de retour rapide
function QuickReturnModal({ 
  game, 
  borrowing, 
  onConfirm, 
  onCancel 
}: {
  game: Game;
  borrowing?: CurrentBorrowing;
  onConfirm: (comment: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [comment, setComment] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(comment);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Retour rapide</h3>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Jeu: <span className="font-medium">{game.name}</span>
            </p>
            {borrowing && (
              <p className="text-sm text-gray-600">
                Emprunté par: <span className="font-medium">
                  {borrowing.member_firstname || ''} {borrowing.member_lastname || ''}
                </span>
              </p>
            )}
            {borrowing && (
              <p className="text-sm text-gray-600">
                Date d'emprunt: <span className="font-medium">
                  {new Date(borrowing.borrow_date).toLocaleDateString('fr-FR')}
                </span>
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Commentaire (optionnel)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="État du jeu, remarques..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700"
              >
                Rendre
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

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
  const [members, setMembers] = useState<Member[]>([]);
  const [currentBorrowings, setCurrentBorrowings] = useState<CurrentBorrowing[]>([]);
  const [currentSeason, setCurrentSeason] = useState<any>(null);
  const [showQuickBorrow, setShowQuickBorrow] = useState<Game | null>(null);
  const [showQuickReturn, setShowQuickReturn] = useState<Game | null>(null);

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
      const [gamesData, membersData, borrowingsData, seasonsData] = await Promise.all([
        GamesService.getAllGames(),
        MembersService.getAllMembers().catch(() => []),
        BorrowingsService.getCurrentBorrowings().catch(() => []),
        SeasonsService.getCurrentSeason().catch(() => null)
      ]);
      
      setGames(gamesData);
      setMembers(membersData);
      setCurrentBorrowings(borrowingsData);
      setCurrentSeason(seasonsData);
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

  const handleBorrowGame = (game: Game) => {
    setShowQuickBorrow(game);
  };

  const handleReturnGame = (game: Game) => {
    setShowQuickReturn(game);
  };

  const handleQuickBorrow = async (memberId: number, borrowDate: string) => {
    if (!showQuickBorrow || !currentSeason) return;

    try {
      await BorrowingsService.createBorrowing({
        id_season: currentSeason.id,
        id_member: memberId,
        id_game: showQuickBorrow.id,
        borrow_date: borrowDate
      });
      
      setShowQuickBorrow(null);
      await loadGames(); // Recharger pour mettre à jour la disponibilité
    } catch (err) {
      alert('Erreur lors de la création de l\'emprunt');
      console.error(err);
    }
  };

  const handleQuickReturn = async (comment: string) => {
    if (!showQuickReturn) return;

    // Trouver l'emprunt en cours pour ce jeu
    const borrowing = currentBorrowings.find(b => b.id_game === showQuickReturn.id);
    if (!borrowing) {
      alert('Aucun emprunt en cours trouvé pour ce jeu');
      return;
    }

    try {
      await BorrowingsService.returnBorrowing(borrowing.id, comment);
      
      setShowQuickReturn(null);
      await loadGames(); // Recharger pour mettre à jour la disponibilité
    } catch (err) {
      alert('Erreur lors du retour de l\'emprunt');
      console.error(err);
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
              onBorrow={handleBorrowGame}
              onReturn={handleReturnGame}
            />
          ))}
        </div>
      )}

      {/* Modal d'emprunt rapide */}
      {showQuickBorrow && (
        <QuickBorrowModal
          game={showQuickBorrow}
          members={members}
          currentSeason={currentSeason}
          onConfirm={handleQuickBorrow}
          onCancel={() => setShowQuickBorrow(null)}
        />
      )}

      {/* Modal de retour rapide */}
      {showQuickReturn && (
        <QuickReturnModal
          game={showQuickReturn}
          borrowing={currentBorrowings.find(b => b.id_game === showQuickReturn.id) || undefined}
          onConfirm={handleQuickReturn}
          onCancel={() => setShowQuickReturn(null)}
        />
      )}
    </div>
  );
}