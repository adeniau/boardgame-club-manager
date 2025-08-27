import React from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { CurrentBorrowing } from '../../types/borrowings';
import { GamesService } from '../../services/gamesService';
import placeholderUser from '/placeholder-user.jpg';
import placeholderGame from '/placeholder-game.jpg';

export interface ActivityFeedProps {
  borrowings: CurrentBorrowing[];
  loading?: boolean;
  title?: string;
  limit?: number;
  showPhotos?: boolean;
  className?: string;
  emptyStateIcon?: React.ReactNode;
  emptyStateMessage?: string | undefined;
}

const ActivityFeedSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="animate-pulse flex items-center space-x-3">
        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
  message = "Aucun emprunt récent" 
}) => (
  <div className="text-center py-8 text-gray-500">
    {icon || (
      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    )}
    <p className="mt-4 text-sm">{message}</p>
  </div>
);

const ActivityItem: React.FC<{
  borrowing: CurrentBorrowing;
  showPhotos: boolean;
}> = ({ borrowing, showPhotos }) => (
  <div className="flex items-center space-x-3 hover:bg-gray-50 -mx-2 px-2 py-2 rounded-md transition-colors duration-200">
    <div className="flex-shrink-0">
      {showPhotos && (
        <img
          className="h-10 w-10 rounded-full object-cover border border-gray-200"
          src={borrowing.member_picture ? GamesService.getImageUrl(borrowing.member_picture) : placeholderUser}
          alt={`${borrowing.member_firstname} ${borrowing.member_lastname}`}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = placeholderUser;
          }}
        />
      )}
      {!showPhotos && (
        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 truncate">
        {borrowing.member_firstname} {borrowing.member_lastname}
      </p>
      <p className="text-sm text-gray-500 truncate">
        {borrowing.game_name} • {format(parseISO(borrowing.borrow_date), 'dd MMM yyyy', { locale: fr })}
      </p>
    </div>
    {showPhotos && (
      <div className="flex-shrink-0">
        <img
          className="h-8 w-8 rounded object-cover border border-gray-200"
          src={borrowing.game_picture ? GamesService.getImageUrl(borrowing.game_picture) : placeholderGame}
          alt={borrowing.game_name}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = placeholderGame;
          }}
        />
      </div>
    )}
  </div>
);

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  borrowings,
  loading = false,
  title = "Emprunts Récents",
  limit,
  showPhotos = true,
  className = '',
  emptyStateIcon,
  emptyStateMessage,
}) => {
  const displayedBorrowings = limit ? borrowings.slice(0, limit) : borrowings;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">{title}</h2>
        {borrowings.length > 0 && limit && borrowings.length > limit && (
          <p className="text-sm text-gray-500 mt-1">
            Affichage de {limit} sur {borrowings.length} emprunts
          </p>
        )}
      </div>
      <div className="p-6">
        {loading ? (
          <ActivityFeedSkeleton count={limit || 3} />
        ) : displayedBorrowings.length === 0 ? (
          <EmptyState icon={emptyStateIcon} message={emptyStateMessage} />
        ) : (
          <div className="space-y-1">
            {displayedBorrowings.map((borrowing) => (
              <ActivityItem
                key={borrowing.id}
                borrowing={borrowing}
                showPhotos={showPhotos}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;