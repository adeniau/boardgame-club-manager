import React from 'react';
import { 
  FunnelIcon,
  ChevronDownIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { EntityType, QuickSearchFilters } from '../../types/search';

interface SearchFiltersProps {
  entityType: EntityType;
  filters: QuickSearchFilters;
  onEntityTypeChange: (entityType: EntityType) => void;
  onFiltersChange: (filters: QuickSearchFilters) => void;
  showEntityFilter?: boolean;
  className?: string;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  entityType,
  filters,
  onEntityTypeChange,
  onFiltersChange,
  showEntityFilter = true,
  className = ''
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const entityTypeLabels = {
    all: 'Tous',
    games: 'Jeux',
    members: 'Membres',
    borrowings: 'Emprunts',
    seasons: 'Saisons'
  };

  const hasActiveFilters = React.useMemo(() => {
    return Object.values(filters).some(filterGroup => 
      filterGroup && Object.values(filterGroup).some(value => value !== undefined && value !== null)
    );
  }, [filters]);

  const clearFilters = () => {
    onFiltersChange({});
  };

  const updateEntityFilters = (entity: keyof QuickSearchFilters, newFilters: any) => {
    onFiltersChange({
      ...filters,
      [entity]: {
        ...filters[entity],
        ...newFilters
      }
    });
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center space-x-2">
        {/* Entity Type Filter */}
        {showEntityFilter && (
          <select
            value={entityType}
            onChange={(e) => onEntityTypeChange(e.target.value as EntityType)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Object.entries(entityTypeLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        )}

        {/* Filters Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`
              flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
              ${hasActiveFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white text-gray-700'}
            `}
          >
            <FunnelIcon className="h-4 w-4" />
            <span>Filtres</span>
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                •
              </span>
            )}
            <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Filters Panel */}
          {isOpen && (
            <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900">Filtres</h3>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Effacer tout
                    </button>
                  )}
                </div>

                {/* Games Filters */}
                {(entityType === 'all' || entityType === 'games') && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Jeux</h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="gameAvailability"
                          checked={filters.games?.available === undefined}
                          onChange={() => updateEntityFilters('games', { available: undefined })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">Tous les jeux</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="gameAvailability"
                          checked={filters.games?.available === true}
                          onChange={() => updateEntityFilters('games', { available: true })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">Disponibles seulement</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="gameAvailability"
                          checked={filters.games?.available === false}
                          onChange={() => updateEntityFilters('games', { available: false })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">Empruntés seulement</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Members Filters */}
                {(entityType === 'all' || entityType === 'members') && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Membres</h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="memberType"
                          checked={filters.members?.admin === undefined}
                          onChange={() => updateEntityFilters('members', { admin: undefined })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">Tous les membres</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="memberType"
                          checked={filters.members?.admin === true}
                          onChange={() => updateEntityFilters('members', { admin: true })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">Administrateurs seulement</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="memberType"
                          checked={filters.members?.admin === false}
                          onChange={() => updateEntityFilters('members', { admin: false })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">Membres standard</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Borrowings Filters */}
                {(entityType === 'all' || entityType === 'borrowings') && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Emprunts</h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="borrowingStatus"
                          checked={filters.borrowings?.status === undefined}
                          onChange={() => updateEntityFilters('borrowings', { status: undefined })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">Tous les emprunts</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="borrowingStatus"
                          checked={filters.borrowings?.status === 'active'}
                          onChange={() => updateEntityFilters('borrowings', { status: 'active' })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">En cours seulement</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="borrowingStatus"
                          checked={filters.borrowings?.status === 'returned'}
                          onChange={() => updateEntityFilters('borrowings', { status: 'returned' })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">Retournés seulement</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Seasons Filters */}
                {(entityType === 'all' || entityType === 'seasons') && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Saisons</h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="seasonType"
                          checked={filters.seasons?.current === undefined}
                          onChange={() => updateEntityFilters('seasons', { current: undefined })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">Toutes les saisons</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="seasonType"
                          checked={filters.seasons?.current === true}
                          onChange={() => updateEntityFilters('seasons', { current: true })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">Saison actuelle seulement</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="seasonType"
                          checked={filters.seasons?.current === false}
                          onChange={() => updateEntityFilters('seasons', { current: false })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">Saisons passées</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
          >
            <span>Filtres actifs</span>
            <XMarkIcon className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Click outside handler */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default SearchFilters;