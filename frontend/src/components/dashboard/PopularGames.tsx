import React from 'react';
import { GamesService } from '../../services/gamesService';

export interface PopularGame {
  id: number;
  name: string;
  picture?: string | undefined;
  borrowCount: number;
}

export interface PopularGamesProps {
  games: PopularGame[];
  loading?: boolean;
  title?: string;
  limit?: number;
  showRanking?: boolean;
  showImages?: boolean;
  className?: string;
  emptyStateIcon?: React.ReactNode;
  emptyStateMessage?: string | undefined;
}

const PopularGamesSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="animate-pulse flex items-center space-x-3">
        <div className="h-10 w-10 bg-gray-200 rounded"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    ))}
  </div>
);

const EmptyState: React.FC<{ 
  icon?: React.ReactNode; 
  message?: string | undefined; 
}> = ({ 
  icon, 
  message = "Aucune donnée disponible" 
}) => (
  <div className="text-center py-8 text-gray-500">
    {icon || (
      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
      </svg>
    )}
    <p className="mt-4 text-sm">{message}</p>
  </div>
);

const getRankingBadge = (index: number): { style: string; text: string } => {
  switch (index) {
    case 0:
      return { 
        style: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        text: '🥇' 
      };
    case 1:
      return { 
        style: 'bg-gray-100 text-gray-800 border-gray-200', 
        text: '🥈' 
      };
    case 2:
      return { 
        style: 'bg-orange-100 text-orange-800 border-orange-200', 
        text: '🥉' 
      };
    default:
      return { 
        style: 'bg-blue-100 text-blue-800 border-blue-200', 
        text: `#${index + 1}` 
      };
  }
};

const GameItem: React.FC<{
  game: PopularGame;
  index: number;
  showRanking: boolean;
  showImages: boolean;
}> = ({ game, index, showRanking, showImages }) => {
  const ranking = getRankingBadge(index);
  
  return (
    <div className="flex items-center space-x-3 hover:bg-gray-50 -mx-2 px-2 py-2 rounded-md transition-colors duration-200">
      {showRanking && (
        <div className="flex-shrink-0 w-8 text-center">
          {index < 3 ? (
            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium border ${ranking.style}`}>
              {ranking.text}
            </span>
          ) : (
            <span className="text-sm font-medium text-gray-400">#{index + 1}</span>
          )}
        </div>
      )}
      
      <div className="flex-shrink-0">
        {showImages ? (
          <img
            className="h-10 w-10 rounded object-cover border border-gray-200"
            src={game.picture ? GamesService.getImageUrl(game.picture) : '/placeholder-game.jpg'}
            alt={game.name}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-game.jpg';
            }}
          />
        ) : (
          <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center border border-gray-200">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
            </svg>
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate" title={game.name}>
          {game.name}
        </p>
        <p className="text-sm text-gray-500">
          {game.borrowCount} emprunt{game.borrowCount > 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
};

export const PopularGames: React.FC<PopularGamesProps> = ({
  games,
  loading = false,
  title = "Jeux Populaires",
  limit,
  showRanking = true,
  showImages = true,
  className = '',
  emptyStateIcon,
  emptyStateMessage,
}) => {
  const displayedGames = limit ? games.slice(0, limit) : games;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">{title}</h2>
        {games.length > 0 && limit && games.length > limit && (
          <p className="text-sm text-gray-500 mt-1">
            Top {limit} sur {games.length} jeux
          </p>
        )}
      </div>
      <div className="p-6">
        {loading ? (
          <PopularGamesSkeleton count={limit || 3} />
        ) : displayedGames.length === 0 ? (
          <EmptyState icon={emptyStateIcon} message={emptyStateMessage} />
        ) : (
          <div className="space-y-1">
            {displayedGames.map((game, index) => (
              <GameItem
                key={game.id}
                game={game}
                index={index}
                showRanking={showRanking}
                showImages={showImages}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PopularGames;