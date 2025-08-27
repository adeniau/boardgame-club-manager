import React, { useState, useEffect, useMemo } from 'react';
import { useBorrowingForm } from '../../hooks/useBorrowingForm';
import { BorrowingsService } from '../../services/borrowingsService';
import { MembersService } from '../../services/membersService';
import { GamesService } from '../../services/gamesService';
import { Member } from '../../types/members';
import { Game } from '../../types/games';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorAlert from '../ui/ErrorAlert';
import { useDebounce } from '../../utils/debounce';

interface CreateBorrowingFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CreateBorrowingForm: React.FC<CreateBorrowingFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const {
    formData,
    errors,
    isSubmitting,
    setIsSubmitting,
    updateSelectedMember,
    updateSelectedGame,
    updateBorrowDate,
    validateForm,
    getCreateRequest,
    reset,
    canSubmit,
    currentSeason,
  } = useBorrowingForm();

  const [members, setMembers] = useState<Member[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [gameSearchTerm, setGameSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [showGameDropdown, setShowGameDropdown] = useState(false);
  const [, setIsSearchingMembers] = useState(false);
  const [, setIsSearchingGames] = useState(false);
  
  // Debouncer les termes de recherche pour ameliorer les performances
  const debouncedMemberSearch = useDebounce(memberSearchTerm, 300);
  const debouncedGameSearch = useDebounce(gameSearchTerm, 300);

  // Charger les membres et jeux
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [membersData, gamesData] = await Promise.all([
          MembersService.getAllMembers(),
          GamesService.getAllGames()
        ]);
        setMembers(membersData);
        setGames(gamesData);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filtrer les membres avec memoization et debouncing
  const filteredMembers = useMemo(() => {
    if (!debouncedMemberSearch.trim()) {
      return members.slice(0, 10); // Limiter les resultats initiaux
    }
    
    const searchTerm = debouncedMemberSearch.toLowerCase();
    return members.filter(member => 
      `${member.firstname || ''} ${member.name || ''}`.toLowerCase().includes(searchTerm) ||
      (member.email || '').toLowerCase().includes(searchTerm)
    ).slice(0, 20); // Limiter les resultats
  }, [members, debouncedMemberSearch]);

  // Filtrer les jeux avec memoization et debouncing
  const filteredGames = useMemo(() => {
    if (!debouncedGameSearch.trim()) {
      return games.filter(game => Number(game.available) > 0).slice(0, 10);
    }
    
    const searchTerm = debouncedGameSearch.toLowerCase();
    return games.filter(game => 
      (game.name || '').toLowerCase().includes(searchTerm) && 
      Number(game.available) > 0
    ).slice(0, 20);
  }, [games, debouncedGameSearch]);

  // Effect pour gerer l'etat de recherche des membres
  useEffect(() => {
    if (debouncedMemberSearch === memberSearchTerm) {
      setIsSearchingMembers(false);
    }
  }, [debouncedMemberSearch, memberSearchTerm]);

  // Effect pour gerer l'etat de recherche des jeux
  useEffect(() => {
    if (debouncedGameSearch === gameSearchTerm) {
      setIsSearchingGames(false);
    }
  }, [debouncedGameSearch, gameSearchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const borrowingRequest = getCreateRequest();
      
      await BorrowingsService.createBorrowing(borrowingRequest);
      
      // Recharger la liste des jeux pour refléter la nouvelle disponibilité
      const updatedGames = await GamesService.getAllGames();
      setGames(updatedGames);
      
      if (onSuccess) {
        onSuccess();
      } else {
        reset();
        setMemberSearchTerm('');
        setGameSearchTerm('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMemberSelect = (member: Member) => {
    updateSelectedMember(member);
    setMemberSearchTerm(`${member.firstname || ''} ${member.name || ''}`);
    setShowMemberDropdown(false);
  };

  const handleGameSelect = (game: Game) => {
    updateSelectedGame(game);
    setGameSearchTerm(game.name || '');
    setShowGameDropdown(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Nouvel Emprunt</h2>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {error && (
          <ErrorAlert 
            message={error} 
            onClose={() => setError(null)} 
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Affichage de la saison courante */}
          {currentSeason && (
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium text-blue-900">
                  Saison courante : {currentSeason.name}
                </span>
              </div>
            </div>
          )}

          {!currentSeason && (
            <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-sm text-yellow-800">
                  Aucune saison active. Veuillez contacter un administrateur.
                </span>
              </div>
            </div>
          )}
          {/* Sélection du membre */}
          <div className="relative">
            <label htmlFor="member" className="block text-sm font-medium text-gray-700 mb-2">
              Membre *
            </label>
            <div className="relative">
              <input
                type="text"
                id="member"
                value={memberSearchTerm}
                onChange={(e) => {
                  setMemberSearchTerm(e.target.value);
                  setShowMemberDropdown(true);
                  if (!e.target.value) updateSelectedMember(null);
                }}
                onFocus={() => setShowMemberDropdown(true)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.selectedMember ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Rechercher un membre..."
              />
              
              {showMemberDropdown && filteredMembers.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredMembers.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => handleMemberSelect(member)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-3"
                    >
                      {member.picture && (
                        <img
                          src={MembersService.getImageUrl(member.picture)}
                          alt={`${member.firstname || ''} ${member.name || ''}`}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium text-gray-900">
                          {member.firstname || ''} {member.name || ''}
                        </div>
                        <div className="text-sm text-gray-500">{member.email || ''}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.selectedMember && (
              <p className="mt-1 text-sm text-red-600">{errors.selectedMember}</p>
            )}
          </div>

          {/* Sélection du jeu */}
          <div className="relative">
            <label htmlFor="game" className="block text-sm font-medium text-gray-700 mb-2">
              Jeu *
            </label>
            <div className="relative">
              <input
                type="text"
                id="game"
                value={gameSearchTerm}
                onChange={(e) => {
                  setGameSearchTerm(e.target.value);
                  setShowGameDropdown(true);
                  if (!e.target.value) updateSelectedGame(null);
                }}
                onFocus={() => setShowGameDropdown(true)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.selectedGame ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Rechercher un jeu disponible..."
              />
              
              {showGameDropdown && filteredGames.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredGames.map((game) => (
                    <button
                      key={game.id}
                      type="button"
                      onClick={() => handleGameSelect(game)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-3"
                    >
                      {game.picture && (
                        <img
                          src={GamesService.getImageUrl(game.picture)}
                          alt={game.name}
                          className="w-8 h-8 rounded object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{game.name}</div>
                        <div className="text-sm text-green-600">Disponible</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.selectedGame && (
              <p className="mt-1 text-sm text-red-600">{errors.selectedGame}</p>
            )}
          </div>

          {/* Date d'emprunt */}
          <div>
            <label htmlFor="borrowDate" className="block text-sm font-medium text-gray-700 mb-2">
              Date d'emprunt *
            </label>
            <input
              type="date"
              id="borrowDate"
              value={formData.borrowDate}
              onChange={(e) => updateBorrowDate(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.borrowDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.borrowDate && (
              <p className="mt-1 text-sm text-red-600">{errors.borrowDate}</p>
            )}
          </div>

          {/* Résumé de l'emprunt */}
          {formData.selectedMember && formData.selectedGame && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Résumé de l'emprunt</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Membre :</span> {formData.selectedMember.firstname} {formData.selectedMember.lastname}
                </div>
                <div>
                  <span className="font-medium">Jeu :</span> {formData.selectedGame.name}
                </div>
                <div>
                  <span className="font-medium">Date :</span> {new Date(formData.borrowDate).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>
          )}

          {/* Boutons */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Annuler
              </button>
            )}
            <button
              type="submit"
              disabled={!canSubmit()}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${
                canSubmit()
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Création...</span>
                </div>
              ) : (
                'Créer l\'emprunt'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBorrowingForm;