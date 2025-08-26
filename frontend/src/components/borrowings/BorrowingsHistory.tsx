import React, { useState, useEffect } from 'react';
import { Borrowing } from '../../types/borrowings';
import { Member } from '../../types/members';
import { Game } from '../../types/games';
import { BorrowingsService } from '../../services/borrowingsService';
import { MembersService } from '../../services/membersService';
import { GamesService } from '../../services/gamesService';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorAlert from '../ui/ErrorAlert';

interface BorrowingsHistoryProps {
  refreshTrigger?: number;
}

interface ExtendedBorrowing extends Borrowing {
  member?: Member | undefined;
  game?: Game | undefined;
}

type FilterType = 'all' | 'returned' | 'current';
type SortField = 'borrow_date' | 'return_date' | 'member_name' | 'game_name';
type SortOrder = 'asc' | 'desc';

const BorrowingsHistory: React.FC<BorrowingsHistoryProps> = ({ refreshTrigger }) => {
  const [borrowings, setBorrowings] = useState<ExtendedBorrowing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtres et recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortField, setSortField] = useState<SortField>('borrow_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const loadBorrowingsHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Charger les données de base
      const [membersData, gamesData] = await Promise.all([
        MembersService.getAllMembers(),
        GamesService.getAllGames(),
      ]);

      // Pour l'historique complet, on utilise les emprunts par membre de tous les membres
      const allBorrowings: ExtendedBorrowing[] = [];
      
      for (const member of membersData) {
        try {
          const memberBorrowings = await BorrowingsService.getBorrowingsByMember(member.id);
          const extendedBorrowings = memberBorrowings.map(borrowing => ({
            ...borrowing,
            member,
            game: gamesData.find(g => g.id === borrowing.id_game) || undefined,
          }));
          allBorrowings.push(...extendedBorrowings);
        } catch (err) {
          console.warn(`Erreur lors du chargement des emprunts pour le membre ${member.id}:`, err);
        }
      }

      // Trier par ID pour éviter les doublons et garder l'ordre
      const uniqueBorrowings = allBorrowings
        .filter((borrowing, index, self) => 
          index === self.findIndex(b => b.id === borrowing.id)
        );

      setBorrowings(uniqueBorrowings);
    } catch (err) {
      setError('Erreur lors du chargement de l\'historique des emprunts');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBorrowingsHistory();
  }, [refreshTrigger]);

  // Filtrer les emprunts
  const filteredBorrowings = borrowings.filter(borrowing => {
    // Filtre par type (tous/retournés/en cours)
    if (filterType === 'returned' && !borrowing.return_date) return false;
    if (filterType === 'current' && borrowing.return_date) return false;

    // Filtre par terme de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const memberName = borrowing.member 
        ? `${borrowing.member.firstname || ''} ${borrowing.member.name || ''}`.toLowerCase()
        : '';
      const memberEmail = borrowing.member?.email?.toLowerCase() || '';
      const gameName = borrowing.game?.name?.toLowerCase() || '';
      
      if (!memberName.includes(term) && 
          !memberEmail.includes(term) && 
          !gameName.includes(term)) {
        return false;
      }
    }

    // Filtre par date
    if (dateFrom) {
      const borrowDate = new Date(borrowing.borrow_date);
      const fromDate = new Date(dateFrom);
      if (borrowDate < fromDate) return false;
    }

    if (dateTo) {
      const borrowDate = new Date(borrowing.borrow_date);
      const toDate = new Date(dateTo);
      if (borrowDate > toDate) return false;
    }

    return true;
  });

  // Trier les emprunts
  const sortedBorrowings = [...filteredBorrowings].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'borrow_date':
        comparison = new Date(a.borrow_date).getTime() - new Date(b.borrow_date).getTime();
        break;
      case 'return_date':
        const aReturnDate = a.return_date ? new Date(a.return_date).getTime() : 0;
        const bReturnDate = b.return_date ? new Date(b.return_date).getTime() : 0;
        comparison = aReturnDate - bReturnDate;
        break;
      case 'member_name':
        const aMemberName = a.member ? `${a.member.firstname || ''} ${a.member.name || ''}` : '';
        const bMemberName = b.member ? `${b.member.firstname || ''} ${b.member.name || ''}` : '';
        comparison = aMemberName.localeCompare(bMemberName);
        break;
      case 'game_name':
        const aGameName = a.game?.name || '';
        const bGameName = b.game?.name || '';
        comparison = aGameName.localeCompare(bGameName);
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const calculateDuration = (borrowDate: string, returnDate: string | null): string => {
    const borrow = new Date(borrowDate);
    const returnD = returnDate ? new Date(returnDate) : new Date();
    const diffTime = returnD.getTime() - borrow.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} jour${diffDays !== 1 ? 's' : ''}`;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    return sortOrder === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
      </svg>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <ErrorAlert 
          message={error} 
          onClose={() => setError(null)} 
        />
      )}

      {/* Filtres */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filtres et recherche</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Recherche */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rechercher
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Membre, jeu..."
            />
          </div>

          {/* Type d'emprunt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les emprunts</option>
              <option value="current">En cours</option>
              <option value="returned">Retournés</option>
            </select>
          </div>

          {/* Date de début */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              À partir du
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Date de fin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jusqu'au
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Bouton de réinitialisation */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterType('all');
              setDateFrom('');
              setDateTo('');
            }}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Réinitialiser les filtres
          </button>
        </div>
      </div>

      {/* Résultats */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Historique des emprunts
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {sortedBorrowings.length} résultat{sortedBorrowings.length !== 1 ? 's' : ''}
          </p>
        </div>

        {sortedBorrowings.length === 0 ? (
          <div className="text-center py-12">
            <svg 
              className="mx-auto h-12 w-12 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
              />
            </svg>
            <p className="mt-4 text-lg font-medium text-gray-900">Aucun emprunt trouvé</p>
            <p className="text-sm text-gray-500 mt-1">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('game_name')}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>Jeu</span>
                      {getSortIcon('game_name')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('member_name')}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>Membre</span>
                      {getSortIcon('member_name')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('borrow_date')}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>Date d'emprunt</span>
                      {getSortIcon('borrow_date')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('return_date')}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>Date de retour</span>
                      {getSortIcon('return_date')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durée
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedBorrowings.map((borrowing) => (
                  <tr key={borrowing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {borrowing.game?.picture && (
                          <img
                            src={GamesService.getImageUrl(borrowing.game.picture)}
                            alt={borrowing.game.name}
                            className="w-10 h-10 rounded object-cover mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {borrowing.game?.name || 'Jeu inconnu'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {borrowing.member?.picture && (
                          <img
                            src={MembersService.getImageUrl(borrowing.member.picture)}
                            alt={`${borrowing.member?.firstname || ''} ${borrowing.member?.name || ''}`}
                            className="w-8 h-8 rounded-full object-cover mr-2"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {borrowing.member 
                              ? `${borrowing.member.firstname || ''} ${borrowing.member.name || ''}`
                              : 'Membre inconnu'
                            }
                          </div>
                          {borrowing.member?.email && (
                            <div className="text-sm text-gray-500">
                              {borrowing.member.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(borrowing.borrow_date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {borrowing.return_date 
                        ? new Date(borrowing.return_date).toLocaleDateString('fr-FR')
                        : '-'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {calculateDuration(borrowing.borrow_date, borrowing.return_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        borrowing.return_date 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {borrowing.return_date ? 'Retourné' : 'En cours'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BorrowingsHistory;