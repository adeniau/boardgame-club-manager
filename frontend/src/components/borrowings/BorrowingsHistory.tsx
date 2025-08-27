import React, { useState, useEffect } from 'react';
import { BorrowingHistoryItem, BorrowingHistoryFilters } from '../../types/borrowings';
import { BorrowingsService } from '../../services/borrowingsService';
import { GamesService } from '../../services/gamesService';
import { MembersService } from '../../services/membersService';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorAlert from '../ui/ErrorAlert';
import { useCSVExport, csvConfigs } from '../../utils/csvExport';

interface BorrowingsHistoryProps {
  refreshTrigger?: number;
}

type FilterType = 'all' | 'returned' | 'current';
type SortField = 'borrow_date' | 'return_date' | 'member_name' | 'game_name';
type SortOrder = 'asc' | 'desc';

const BorrowingsHistory: React.FC<BorrowingsHistoryProps> = ({ refreshTrigger }) => {
  const [borrowings, setBorrowings] = useState<BorrowingHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Export CSV
  const { exportData, isExporting, exportError, clearError } = useCSVExport();
  
  // Filtres et recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortField, setSortField] = useState<SortField>('borrow_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [limit, setLimit] = useState(100);

  const loadBorrowingsHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Preparer les filtres pour l'API
      const filters: BorrowingHistoryFilters = {
        limit,
      };
      
      if (filterType !== 'all') {
        filters.status = filterType;
      }
      
      if (dateFrom) {
        filters.dateFrom = dateFrom;
      }
      
      if (dateTo) {
        filters.dateTo = dateTo;
      }
      
      // Utiliser la nouvelle API optimisee
      const historyData = await BorrowingsService.getBorrowingsHistory(filters);
      setBorrowings(historyData);
    } catch (err) {
      setError('Erreur lors du chargement de l\'historique des emprunts');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBorrowingsHistory();
  }, [refreshTrigger, filterType, dateFrom, dateTo, limit]);

  // Filtrer les emprunts selon le terme de recherche (cote client pour la reactivite)
  const filteredBorrowings = borrowings.filter(borrowing => {
    // Filtre par terme de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const memberName = `${borrowing.member_firstname || ''} ${borrowing.member_lastname || ''}`.toLowerCase();
      const memberEmail = borrowing.member_email?.toLowerCase() || '';
      const gameName = borrowing.game_name?.toLowerCase() || '';
      
      if (!memberName.includes(term) && 
          !memberEmail.includes(term) && 
          !gameName.includes(term)) {
        return false;
      }
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
        const aMemberName = `${a.member_firstname || ''} ${a.member_lastname || ''}`;
        const bMemberName = `${b.member_firstname || ''} ${b.member_lastname || ''}`;
        comparison = aMemberName.localeCompare(bMemberName);
        break;
      case 'game_name':
        const aGameName = a.game_name || '';
        const bGameName = b.game_name || '';
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

  const handleReloadData = () => {
    loadBorrowingsHistory();
  };

  const handleExportCSV = async () => {
    try {
      const exportData_filtered = filteredBorrowings.map(borrowing => ({
        ...borrowing,
        status: borrowing.return_date ? 'Retourne' : 'En cours'
      }));
      
      const filename = `historique-emprunts-${new Date().toISOString().split('T')[0]}`;
      await exportData(exportData_filtered, csvConfigs.borrowingsHistory, filename);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    }
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

      {exportError && (
        <ErrorAlert 
          message={`Erreur d'export: ${exportError}`} 
          onClose={clearError} 
        />
      )}

      {/* Filtres */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filtres et recherche</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
              <option value="returned">Retournes</option>
            </select>
          </div>

          {/* Date de debut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              A partir du
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

          {/* Limite */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Limite
            </label>
            <select
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={50}>50 resultats</option>
              <option value={100}>100 resultats</option>
              <option value={200}>200 resultats</option>
              <option value={500}>500 resultats</option>
            </select>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="mt-4 flex justify-between">
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterType('all');
              setDateFrom('');
              setDateTo('');
              setLimit(100);
            }}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Reinitialiser les filtres
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={handleExportCSV}
              disabled={isExporting || sortedBorrowings.length === 0}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isExporting ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Export...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Exporter CSV
                </>
              )}
            </button>
            
            <button
              onClick={handleReloadData}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
            >
              Actualiser
            </button>
          </div>
        </div>
      </div>

      {/* Resultats */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Historique des emprunts
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {sortedBorrowings.length} resultat{sortedBorrowings.length !== 1 ? 's' : ''} 
            {borrowings.length >= limit && ` (limite de ${limit} appliquée)`}
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
            <p className="mt-4 text-lg font-medium text-gray-900">Aucun emprunt trouve</p>
            <p className="text-sm text-gray-500 mt-1">
              Essayez de modifier vos criteres de recherche
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
                    Duree
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
                        {borrowing.game_picture && (
                          <img
                            src={GamesService.getImageUrl(borrowing.game_picture)}
                            alt={borrowing.game_name}
                            className="w-10 h-10 rounded object-cover mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {borrowing.game_name || 'Jeu inconnu'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {borrowing.member_picture && (
                          <img
                            src={MembersService.getImageUrl(borrowing.member_picture)}
                            alt={`${borrowing.member_firstname || ''} ${borrowing.member_lastname || ''}`}
                            className="w-8 h-8 rounded-full object-cover mr-2"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {`${borrowing.member_firstname || ''} ${borrowing.member_lastname || ''}`}
                          </div>
                          {borrowing.member_email && (
                            <div className="text-sm text-gray-500">
                              {borrowing.member_email}
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
                        {borrowing.return_date ? 'Retourne' : 'En cours'}
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