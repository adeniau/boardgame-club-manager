import React from 'react';
import { Season } from '../../types/seasons';
import { CalendarIcon, UsersIcon, CubeIcon } from '@heroicons/react/24/outline';

interface SeasonCardProps {
  season: Season;
  onClick: (season: Season) => void;
}

const SeasonCard: React.FC<SeasonCardProps> = ({ season, onClick }) => {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Non définie';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getSeasonStatus = () => {
    if (season.is_current) {
      return {
        label: 'Saison actuelle',
        className: 'bg-green-100 text-green-800'
      };
    }
    
    if (season.is_archived) {
      return {
        label: 'Archivée',
        className: 'bg-gray-100 text-gray-800'
      };
    }

    // Si pas current et pas archived, c'est une saison active
    return {
      label: 'Active',
      className: 'bg-blue-100 text-blue-800'
    };
  };

  const status = getSeasonStatus();

  return (
    <div
      onClick={() => onClick(season)}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Header avec nom et statut */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900 truncate">
            {season.name}
          </h3>
          {season.description && (
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
              {season.description}
            </p>
          )}
        </div>
        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className} flex-shrink-0`}>
          {status.label}
        </span>
      </div>

      {/* Dates */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-500">
          <CalendarIcon className="h-4 w-4 mr-2" />
          <span>Début: {formatDate(season.start_date)}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <CalendarIcon className="h-4 w-4 mr-2" />
          <span>Fin: {formatDate(season.end_date)}</span>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
        <div className="flex items-center text-sm">
          <UsersIcon className="h-4 w-4 text-blue-500 mr-1" />
          <span className="text-gray-600">
            {season.member_count || 0} membre{(season.member_count || 0) > 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center text-sm">
          <CubeIcon className="h-4 w-4 text-green-500 mr-1" />
          <span className="text-gray-600">
            {season.borrowing_count || 0} emprunt{(season.borrowing_count || 0) > 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SeasonCard;