import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { useSearch } from '../../hooks/search';
import { EntityType, QuickSearchFilters, BorrowingMetadata, SeasonMetadata } from '../../types/search';
import { SearchBar, SearchResults, SearchFilters } from '../../components/search';
import { exportToCSV } from '../../utils/csvExport';

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedEntityType, setSelectedEntityType] = useState<EntityType>('all');
  const [filters, setFilters] = useState<QuickSearchFilters>({});

  // Get initial values from URL params
  const initialQuery = searchParams.get('q') || '';
  const initialEntityType = (searchParams.get('type') as EntityType) || 'all';

  // Search hook
  const {
    query,
    results,
    totalCount,
    loading,
    error,
    hasSearched,
    setQuery,
    search,
    clearResults,
    retry,
    loadMore,
    canLoadMore,
    setEntityType
  } = useSearch({
    entityType: initialEntityType,
    autoSearch: false, // Manual search control
    limit: 24
  });

  // Set initial state from URL
  useEffect(() => {
    setSelectedEntityType(initialEntityType);
    if (initialQuery) {
      setQuery(initialQuery);
      setEntityType(initialEntityType);
      search(initialQuery);
    }
  }, []); // Only run on mount

  // Update URL when search parameters change
  const updateURL = (newQuery: string, newEntityType: EntityType) => {
    const params = new URLSearchParams();
    if (newQuery) params.set('q', newQuery);
    if (newEntityType && newEntityType !== 'all') params.set('type', newEntityType);
    setSearchParams(params);
  };

  // Handle search
  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setEntityType(selectedEntityType);
    updateURL(searchQuery, selectedEntityType);
    search(searchQuery);
  };

  // Handle entity type change
  const handleEntityTypeChange = (newEntityType: EntityType) => {
    setSelectedEntityType(newEntityType);
    setEntityType(newEntityType);
    if (query) {
      updateURL(query, newEntityType);
      search(query);
    }
  };

  // Handle filters change
  const handleFiltersChange = (newFilters: QuickSearchFilters) => {
    setFilters(newFilters);
    // Apply filters logic here - would need to extend the search hook to handle complex filters
    if (query) {
      search(query);
    }
  };

  // Handle export results
  const handleExportResults = () => {
    if (results.length === 0) return;

    const csvData = results.map(result => {
      const baseData = {
        Type: result.type,
        Titre: result.title.replace(/<[^>]*>/g, ''), // Remove HTML tags
        Description: result.description.replace(/<[^>]*>/g, ''),
        Score: result.score
      };

      // Add type-specific data
      switch (result.type) {
        case 'game':
          return {
            ...baseData,
            Disponible: result.metadata.available === '1' ? 'Oui' : 'Non',
            Image: result.metadata.picture || ''
          };
        case 'member':
          return {
            ...baseData,
            Email: result.metadata.email,
            Administrateur: result.metadata.isAdmin ? 'Oui' : 'Non'
          };
        case 'borrowing': {
          const metadata = result.metadata as BorrowingMetadata;
          return {
            ...baseData,
            Membre: metadata.memberName,
            Jeu: metadata.gameName,
            Saison: metadata.seasonName,
            Statut: metadata.isActive ? 'En cours' : 'Retourne',
            'Date emprunt': metadata.borrowDate,
            'Date retour': metadata.returnDate || 'N/A'
          };
        }
        case 'season': {
          const metadata = result.metadata as SeasonMetadata;
          return {
            ...baseData,
            Actuelle: metadata.isCurrent ? 'Oui' : 'Non',
            'Date debut': metadata.startDate,
            'Date fin': metadata.endDate
          };
        }
        default:
          return baseData;
      }
    });

    const columns = Object.keys(csvData[0] || {}).map(key => ({ key, label: key }));
    const filename = `recherche_${query.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}`;
    exportToCSV(csvData, columns, filename);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ChevronLeftIcon className="h-5 w-5 mr-1" />
                Retour
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Recherche</h1>
            </div>
            
            {/* Export button */}
            {results.length > 0 && (
              <button
                onClick={handleExportResults}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <DocumentArrowDownIcon className="h-4 w-4" />
                <span>Exporter ({totalCount})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Interface */}
        <div className="mb-8">
          <div className="max-w-3xl mx-auto">
            <SearchBar
              placeholder="Rechercher des jeux, membres, emprunts, saisons..."
              onSearch={handleSearch}
              entityType={selectedEntityType}
              showFilters={false}
              showSuggestions={true}
              size="lg"
              autoFocus={!initialQuery}
              className="mb-4"
            />
            
            {/* Filters */}
            <div className="flex justify-center">
              <SearchFilters
                entityType={selectedEntityType}
                filters={filters}
                onEntityTypeChange={handleEntityTypeChange}
                onFiltersChange={handleFiltersChange}
                showEntityFilter={true}
              />
            </div>
          </div>
        </div>

        {/* Search Results */}
        <div className="max-w-5xl mx-auto">
          {/* Search Tips - Show when no search has been performed */}
          {!hasSearched && !loading && (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Recherchez dans votre club
                </h2>
                <p className="text-gray-600 mb-8">
                  Utilisez la barre de recherche ci-dessus pour trouver des jeux, des membres, 
                  des emprunts ou des saisons. Vous pouvez filtrer par type et utiliser 
                  les suggestions automatiques.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-2">Conseils de recherche</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Tapez au moins 2 caractères</li>
                      <li>• Utilisez des mots-clés simples</li>
                      <li>• Essayez les suggestions automatiques</li>
                      <li>• Filtrez par type pour des résultats précis</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-2">Types de recherche</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• <strong>Jeux :</strong> nom, disponibilité</li>
                      <li>• <strong>Membres :</strong> nom, email, rôle</li>
                      <li>• <strong>Emprunts :</strong> jeu, membre, statut</li>
                      <li>• <strong>Saisons :</strong> nom, description, période</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {(hasSearched || loading) && (
            <SearchResults
              results={results}
              totalCount={totalCount}
              query={query}
              loading={loading}
              error={error}
              showCategories={selectedEntityType === 'all'}
              onLoadMore={loadMore}
              canLoadMore={canLoadMore}
            />
          )}

          {/* Retry button for errors */}
          {error && (
            <div className="text-center mt-8">
              <button
                onClick={retry}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Réessayer
              </button>
            </div>
          )}

          {/* Clear results */}
          {hasSearched && !loading && (
            <div className="text-center mt-8">
              <button
                onClick={() => {
                  clearResults();
                  setQuery('');
                  setSearchParams({});
                }}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Effacer la recherche
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;