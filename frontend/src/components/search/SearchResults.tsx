import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PuzzlePieceIcon as GamepadIcon,
  UserIcon,
  ArchiveBoxIcon,
  CalendarIcon,
  EyeIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { SearchResult, GameMetadata, MemberMetadata, BorrowingMetadata, SeasonMetadata } from '../../types/search';
import { GamesService } from '../../services/gamesService';

interface SearchResultsProps {
  results: SearchResult[];
  totalCount: number;
  query: string;
  loading?: boolean;
  error?: string | null;
  showCategories?: boolean;
  onResultClick?: (result: SearchResult) => void;
  onLoadMore?: () => void;
  canLoadMore?: boolean;
  className?: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  totalCount,
  query,
  loading = false,
  error = null,
  showCategories = true,
  onResultClick,
  onLoadMore,
  canLoadMore = false,
  className = ''
}) => {
  const navigate = useNavigate();

  // Group results by type for categorized display
  const categorizedResults = React.useMemo(() => {
    const categories = {
      games: results.filter(r => r.type === 'game'),
      members: results.filter(r => r.type === 'member'),
      borrowings: results.filter(r => r.type === 'borrowing'),
      seasons: results.filter(r => r.type === 'season')
    };
    return categories;
  }, [results]);

  // Handle result click with navigation
  const handleResultClick = (result: SearchResult) => {
    if (onResultClick) {
      onResultClick(result);
      return;
    }

    // Default navigation behavior
    switch (result.type) {
      case 'game':
        navigate(`/games/${result.id}`);
        break;
      case 'member':
        navigate(`/members/${result.id}`);
        break;
      case 'borrowing':
        navigate(`/borrowings`);
        break;
      case 'season':
        navigate(`/seasons/${result.id}`);
        break;
    }
  };

  // Component for individual result item
  const ResultItem: React.FC<{ result: SearchResult; showType?: boolean }> = ({ result, showType = false }) => {
    const getIcon = () => {
      switch (result.type) {
        case 'game':
          return <GamepadIcon className="h-5 w-5 text-blue-500" />;
        case 'member':
          return <UserIcon className="h-5 w-5 text-green-500" />;
        case 'borrowing':
          return <ArchiveBoxIcon className="h-5 w-5 text-orange-500" />;
        case 'season':
          return <CalendarIcon className="h-5 w-5 text-purple-500" />;
      }
    };

    const getTypeLabel = () => {
      switch (result.type) {
        case 'game':
          return 'Jeu';
        case 'member':
          return 'Membre';
        case 'borrowing':
          return 'Emprunt';
        case 'season':
          return 'Saison';
      }
    };

    const getStatusBadge = () => {
      switch (result.type) {
        case 'game':
          const gameData = result.metadata as GameMetadata;
          return gameData.available === '1' ? (
            <CheckCircleIcon className="h-4 w-4 text-green-500" title="Disponible" />
          ) : (
            <XCircleIcon className="h-4 w-4 text-red-500" title="Emprunté" />
          );
        case 'member':
          const memberData = result.metadata as MemberMetadata;
          return memberData.isAdmin ? (
            <ShieldCheckIcon className="h-4 w-4 text-yellow-500" title="Administrateur" />
          ) : null;
        case 'borrowing':
          const borrowingData = result.metadata as BorrowingMetadata;
          return borrowingData.isActive ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              En cours
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Retourné
            </span>
          );
        case 'season':
          const seasonData = result.metadata as SeasonMetadata;
          return seasonData.isCurrent ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Actuelle
            </span>
          ) : null;
      }
    };

    const getImage = () => {
      switch (result.type) {
        case 'game':
          const gameData = result.metadata as GameMetadata;
          return gameData.picture ? (
            <img
              src={GamesService.getImageUrl(gameData.picture)}
              alt={gameData.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
              <GamepadIcon className="h-6 w-6 text-gray-400" />
            </div>
          );
        case 'member':
          const memberData = result.metadata as MemberMetadata;
          return memberData.picture ? (
            <img
              src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${memberData.picture}`}
              alt={`${memberData.firstname} ${memberData.name}`}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              <UserIcon className="h-6 w-6 text-gray-400" />
            </div>
          );
        case 'borrowing':
          const borrowingData = result.metadata as BorrowingMetadata;
          return borrowingData.gamePicture ? (
            <img
              src={GamesService.getImageUrl(borrowingData.gamePicture)}
              alt={borrowingData.gameName}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
              <ArchiveBoxIcon className="h-6 w-6 text-gray-400" />
            </div>
          );
        default:
          return (
            <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
              {getIcon()}
            </div>
          );
      }
    };

    return (
      <div
        onClick={() => handleResultClick(result)}
        className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
      >
        <div className="flex items-center space-x-4">
          {getImage()}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              {showType && (
                <span className="inline-flex items-center space-x-1 text-xs font-medium text-gray-500">
                  {getIcon()}
                  <span>{getTypeLabel()}</span>
                </span>
              )}
              <div className="flex items-center space-x-2">
                {getStatusBadge()}
              </div>
            </div>
            
            <h3 
              className="text-sm font-semibold text-gray-900 truncate"
              dangerouslySetInnerHTML={{ __html: result.title }}
            />
            
            <p 
              className="text-sm text-gray-600 truncate mt-1"
              dangerouslySetInnerHTML={{ __html: result.description }}
            />
          </div>
          
          <EyeIcon className="h-5 w-5 text-gray-400" />
        </div>
      </div>
    );
  };

  // Category section component
  const CategorySection: React.FC<{ 
    title: string; 
    results: SearchResult[]; 
    icon: React.ReactNode;
    color: string;
  }> = ({ title, results, icon, color }) => {
    if (results.length === 0) return null;

    return (
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <div className={`p-1 rounded-lg ${color}`}>
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {title} ({results.length})
          </h3>
        </div>
        <div className="bg-white rounded-lg border border-gray-200">
          {results.map((result, index) => (
            <ResultItem key={`${result.type}-${result.id}`} result={result} />
          ))}
        </div>
      </div>
    );
  };

  // Error state
  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <XCircleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de recherche</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  // No results state
  if (!loading && results.length === 0 && query) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <GamepadIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun résultat</h3>
        <p className="text-gray-600">
          Aucun résultat trouvé pour "<span className="font-semibold">{query}</span>"
        </p>
        <div className="mt-4 text-sm text-gray-500">
          <p>Suggestions :</p>
          <ul className="mt-2 space-y-1">
            <li>• Vérifiez l'orthographe</li>
            <li>• Essayez des mots-clés plus généraux</li>
            <li>• Essayez des synonymes</li>
          </ul>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading && results.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Recherche en cours...</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Results header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {totalCount} résultat{totalCount > 1 ? 's' : ''} pour "{query}"
          </h2>
          {loading && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          )}
        </div>
        <p className="text-gray-600 mt-1">
          {results.length} résultat{results.length > 1 ? 's' : ''} affiché{results.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Results display */}
      {showCategories ? (
        <div>
          <CategorySection
            title="Jeux"
            results={categorizedResults.games}
            icon={<GamepadIcon className="h-5 w-5 text-white" />}
            color="bg-blue-500"
          />
          <CategorySection
            title="Membres"
            results={categorizedResults.members}
            icon={<UserIcon className="h-5 w-5 text-white" />}
            color="bg-green-500"
          />
          <CategorySection
            title="Emprunts"
            results={categorizedResults.borrowings}
            icon={<ArchiveBoxIcon className="h-5 w-5 text-white" />}
            color="bg-orange-500"
          />
          <CategorySection
            title="Saisons"
            results={categorizedResults.seasons}
            icon={<CalendarIcon className="h-5 w-5 text-white" />}
            color="bg-purple-500"
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200">
          {results.map((result, index) => (
            <ResultItem 
              key={`${result.type}-${result.id}`} 
              result={result} 
              showType={true}
            />
          ))}
        </div>
      )}

      {/* Load more button */}
      {canLoadMore && (
        <div className="text-center mt-6">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Chargement...
              </>
            ) : (
              'Afficher plus de résultats'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchResults;