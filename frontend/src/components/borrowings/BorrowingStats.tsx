import React, { useState, useEffect } from 'react';
import { BorrowingsService } from '../../services/borrowingsService';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorAlert from '../ui/ErrorAlert';

interface BorrowingStatsProps {
  refreshTrigger?: number;
}

interface Stats {
  currentBorrowings: number;
  monthlyBorrowings: number;
  overdueBorrowings: number;
  popularGames: Array<{
    game_name: string;
    borrow_count: number;
  }>;
}

const BorrowingStats: React.FC<BorrowingStatsProps> = ({ refreshTrigger }) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const statsData = await BorrowingsService.getBorrowingStats();
      setStats(statsData);
    } catch (err) {
      setError('Erreur lors du chargement des statistiques');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [refreshTrigger]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <ErrorAlert message={error} onClose={() => setError(null)} />
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const getStatCardColor = (value: number, type: 'current' | 'monthly' | 'overdue') => {
    switch (type) {
      case 'current':
        return value > 10 ? 'text-blue-600' : 'text-blue-500';
      case 'monthly':
        return value > 20 ? 'text-green-600' : 'text-green-500';
      case 'overdue':
        return value > 0 ? 'text-red-600' : 'text-gray-500';
      default:
        return 'text-gray-600';
    }
  };

  const getStatCardIcon = (type: 'current' | 'monthly' | 'overdue' | 'popular') => {
    switch (type) {
      case 'current':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      case 'monthly':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'overdue':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'popular':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Statistiques des emprunts</h2>
        <p className="text-sm text-gray-500 mt-1">
          Vue d'ensemble de l'activite des emprunts
        </p>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Emprunts en cours */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Emprunts en cours</p>
              <p className={`text-3xl font-bold ${getStatCardColor(stats.currentBorrowings, 'current')}`}>
                {stats.currentBorrowings}
              </p>
            </div>
            <div className={getStatCardColor(stats.currentBorrowings, 'current')}>
              {getStatCardIcon('current')}
            </div>
          </div>
        </div>

        {/* Emprunts ce mois */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Emprunts ce mois</p>
              <p className={`text-3xl font-bold ${getStatCardColor(stats.monthlyBorrowings, 'monthly')}`}>
                {stats.monthlyBorrowings}
              </p>
            </div>
            <div className={getStatCardColor(stats.monthlyBorrowings, 'monthly')}>
              {getStatCardIcon('monthly')}
            </div>
          </div>
        </div>

        {/* Emprunts en retard */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Emprunts en retard</p>
              <p className={`text-3xl font-bold ${getStatCardColor(stats.overdueBorrowings, 'overdue')}`}>
                {stats.overdueBorrowings}
              </p>
            </div>
            <div className={getStatCardColor(stats.overdueBorrowings, 'overdue')}>
              {getStatCardIcon('overdue')}
            </div>
          </div>
          {stats.overdueBorrowings > 0 && (
            <div className="mt-2">
              <span className="text-xs text-red-600 font-medium">
                Action requise
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Jeux les plus populaires */}
      {stats.popularGames && stats.popularGames.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="text-yellow-600 mr-3">
              {getStatCardIcon('popular')}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Jeux les plus empruntes</h3>
              <p className="text-sm text-gray-500">Top 5 des jeux les plus populaires</p>
            </div>
          </div>

          <div className="space-y-3">
            {stats.popularGames.map((game, index) => {
              const maxBorrows = Math.max(...stats.popularGames.map(g => g.borrow_count));
              const percentage = (game.borrow_count / maxBorrows) * 100;
              
              return (
                <div key={game.game_name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-800">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {game.game_name}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-sm font-semibold text-gray-900">
                        {game.borrow_count} emprunt{game.borrow_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-900">
              Actions recommandees
            </h4>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                {stats.overdueBorrowings > 0 && (
                  <li>Contacter les membres avec des emprunts en retard</li>
                )}
                {stats.currentBorrowings === 0 && (
                  <li>Promouvoir les jeux populaires pour encourager les emprunts</li>
                )}
                {stats.monthlyBorrowings > 30 && (
                  <li>Considerer l'achat de nouveaux jeux populaires</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BorrowingStats;