import { useState, useCallback, useRef, useEffect } from 'react';
import { SearchService } from '../../services/searchService';
import {
  SearchResult,
  SearchResponse,
  SearchFilters,
  EntityType,
  QuickSearchFilters
} from '../../types/search';
import { debounce } from '../../utils/debounce';

export interface UseSearchOptions {
  debounceDelay?: number;
  entityType?: EntityType;
  filters?: QuickSearchFilters[keyof QuickSearchFilters];
  autoSearch?: boolean;
  limit?: number;
}

export interface UseSearchReturn {
  // State
  query: string;
  results: SearchResult[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
  
  // Actions
  setQuery: (query: string) => void;
  search: (searchQuery?: string) => Promise<void>;
  clearResults: () => void;
  retry: () => Promise<void>;
  
  // Pagination
  loadMore: () => Promise<void>;
  canLoadMore: boolean;
  
  // Filters
  setFilters: (filters: QuickSearchFilters[keyof QuickSearchFilters]) => void;
  setEntityType: (entityType: EntityType) => void;
}

export const useSearch = (options: UseSearchOptions = {}): UseSearchReturn => {
  const {
    debounceDelay = 300,
    entityType = 'all',
    filters,
    autoSearch = true,
    limit = 20
  } = options;

  const [query, setQueryState] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentEntityType, setCurrentEntityType] = useState<EntityType>(entityType);
  const [currentFilters, setCurrentFilters] = useState<QuickSearchFilters[keyof QuickSearchFilters] | undefined>(filters);
  const [offset, setOffset] = useState(0);

  const lastSearchRef = useRef<{
    query: string;
    entityType: EntityType;
    filters?: QuickSearchFilters[keyof QuickSearchFilters];
    timestamp: number;
  } | null>(null);

  const performSearch = useCallback(async (
    searchQuery: string,
    searchEntityType: EntityType = currentEntityType,
    searchFilters?: QuickSearchFilters[keyof QuickSearchFilters],
    searchOffset: number = 0,
    append: boolean = false
  ) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setTotalCount(0);
      setHasSearched(false);
      setError(null);
      return;
    }

    const searchTimestamp = Date.now();
    lastSearchRef.current = {
      query: searchQuery,
      entityType: searchEntityType,
      filters: searchFilters,
      timestamp: searchTimestamp
    };

    setLoading(true);
    setError(null);

    if (!append) {
      setOffset(0);
    }

    try {
      let response: SearchResponse;

      if (searchEntityType === 'all') {
        response = await SearchService.globalSearch(searchQuery, { limit });
      } else {
        response = await SearchService.searchEntity(
          searchEntityType,
          searchQuery,
          searchFilters,
          { limit, offset: searchOffset }
        );
      }

      // Check if this is still the latest search
      if (lastSearchRef.current?.timestamp === searchTimestamp) {
        if (append) {
          setResults(prev => [...prev, ...response.results]);
        } else {
          setResults(response.results);
        }
        setTotalCount(response.totalCount);
        setHasSearched(true);
      }
    } catch (err) {
      // Only set error if this is still the latest search
      if (lastSearchRef.current?.timestamp === searchTimestamp) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la recherche';
        setError(errorMessage);
        if (!append) {
          setResults([]);
          setTotalCount(0);
        }
      }
    } finally {
      if (lastSearchRef.current?.timestamp === searchTimestamp) {
        setLoading(false);
      }
    }
  }, [currentEntityType, limit]);

  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      if (autoSearch) {
        performSearch(searchQuery, currentEntityType, currentFilters);
      }
    }, debounceDelay),
    [performSearch, currentEntityType, currentFilters, autoSearch]
  );

  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
    if (autoSearch) {
      debouncedSearch(newQuery);
    }
  }, [debouncedSearch, autoSearch]);

  const search = useCallback(async (searchQuery?: string) => {
    const queryToSearch = searchQuery || query;
    await performSearch(queryToSearch, currentEntityType, currentFilters);
  }, [query, performSearch, currentEntityType, currentFilters]);

  const clearResults = useCallback(() => {
    setResults([]);
    setTotalCount(0);
    setHasSearched(false);
    setError(null);
    setOffset(0);
    lastSearchRef.current = null;
  }, []);

  const retry = useCallback(async () => {
    if (query) {
      await performSearch(query, currentEntityType, currentFilters);
    }
  }, [query, performSearch, currentEntityType, currentFilters]);

  const loadMore = useCallback(async () => {
    if (!query || loading || results.length >= totalCount) {
      return;
    }

    const newOffset = offset + limit;
    setOffset(newOffset);
    await performSearch(query, currentEntityType, currentFilters, newOffset, true);
  }, [query, loading, results.length, totalCount, offset, limit, performSearch, currentEntityType, currentFilters]);

  const canLoadMore = results.length < totalCount && !loading;

  const setFilters = useCallback((newFilters: QuickSearchFilters[keyof QuickSearchFilters]) => {
    setCurrentFilters(newFilters);
    if (query && autoSearch) {
      performSearch(query, currentEntityType, newFilters);
    }
  }, [query, currentEntityType, performSearch, autoSearch]);

  const setEntityType = useCallback((newEntityType: EntityType) => {
    setCurrentEntityType(newEntityType);
    if (query && autoSearch) {
      performSearch(query, newEntityType, currentFilters);
    }
  }, [query, currentFilters, performSearch, autoSearch]);

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return {
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
    setFilters,
    setEntityType
  };
};