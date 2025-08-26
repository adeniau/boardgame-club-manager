import React, { useState, useEffect } from 'react';
import { CurrentBorrowing } from '../../types/borrowings';
import { BorrowingsService } from '../../services/borrowingsService';
import { GamesService } from '../../services/gamesService';
import { MembersService } from '../../services/membersService';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorAlert from '../ui/ErrorAlert';

interface CurrentBorrowingsProps {
  onReturnClick?: (borrowing: CurrentBorrowing) => void;
  refreshTrigger?: number;
}

const CurrentBorrowings: React.FC<CurrentBorrowingsProps> = ({
  onReturnClick,
  refreshTrigger,
}) => {
  const [borrowings, setBorrowings] = useState<CurrentBorrowing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'member' | 'game'>('date');

  const loadCurrentBorrowings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await BorrowingsService.getCurrentBorrowings();
      setBorrowings(data);
    } catch (err) {
      setError('Erreur lors du chargement des emprunts en cours');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentBorrowings();
  }, [refreshTrigger]);

  // Filtrer les emprunts selon le terme de recherche
  const filteredBorrowings = borrowings.filter(borrowing =>
    (borrowing.member_firstname || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (borrowing.member_lastname || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (borrowing.game_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (borrowing.member_email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Trier les emprunts
  const sortedBorrowings = [...filteredBorrowings].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.borrow_date).getTime() - new Date(a.borrow_date).getTime();
      case 'member':
        const aMember = `${a.member_firstname || ''} ${a.member_lastname || ''}`;
        const bMember = `${b.member_firstname || ''} ${b.member_lastname || ''}`;
        return aMember.localeCompare(bMember);
      case 'game':
        return (a.game_name || '').localeCompare(b.game_name || '');
      default:
        return 0;
    }
  });

  const calculateBorrowDuration = (borrowDate: string): number => {
    const borrow = new Date(borrowDate);
    const now = new Date();
    const diffTime = now.getTime() - borrow.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDurationColor = (duration: number): string => {
    if (duration <= 7) return 'text-green-600';
    if (duration <= 14) return 'text-yellow-600';
    return 'text-red-600';
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

      {/* En-tête avec recherche et tri */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Emprunts en cours</h2>
          <p className="text-sm text-gray-500 mt-1">
            {sortedBorrowings.length} emprunt{sortedBorrowings.length !== 1 ? 's' : ''} en cours
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Recherche */}
          <div className="relative">
            <svg 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
            />
          </div>
          
          {/* Tri */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'member' | 'game')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="date">Trier par date</option>
            <option value="member">Trier par membre</option>
            <option value="game">Trier par jeu</option>
          </select>
        </div>
      </div>

      {/* Liste des emprunts */}
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
          <p className="mt-4 text-lg font-medium text-gray-900">Aucun emprunt en cours</p>
          <p className="text-sm text-gray-500 mt-1">
            {searchTerm ? 'Aucun résultat pour cette recherche' : 'Tous les jeux sont disponibles'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sortedBorrowings.map((borrowing) => {
            const duration = calculateBorrowDuration(borrowing.borrow_date);
            const durationColor = getDurationColor(duration);
            
            return (
              <div
                key={borrowing.id}
                className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Photo du jeu */}
                    <div className="flex-shrink-0">
                      <img
                        src={GamesService.getImageUrl(borrowing.game_picture)}
                        alt={borrowing.game_name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    </div>
                    
                    {/* Informations principales */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {borrowing.game_name}
                          </h3>
                          <div className="flex items-center mt-1">
                            {borrowing.member_picture && (
                              <img
                                src={MembersService.getImageUrl(borrowing.member_picture)}
                                alt={`${borrowing.member_firstname || ''} ${borrowing.member_lastname || ''}`}
                                className="w-6 h-6 rounded-full object-cover mr-2"
                              />
                            )}
                            <span className="text-gray-600">
                              {borrowing.member_firstname || ''} {borrowing.member_lastname || ''}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            Emprunté le {new Date(borrowing.borrow_date).toLocaleDateString('fr-FR')}
                          </div>
                          <div className={`text-sm font-medium ${durationColor}`}>
                            {duration} jour{duration !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      
                      {/* Contact du membre */}
                      <div className="mt-2 text-sm text-gray-500 space-y-1">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {borrowing.member_email}
                        </div>
                        {borrowing.member_phone && (
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {borrowing.member_phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Bouton de retour */}
                  {onReturnClick && (
                    <div className="ml-4">
                      <button
                        onClick={() => onReturnClick(borrowing)}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                      >
                        Marquer comme retourné
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CurrentBorrowings;