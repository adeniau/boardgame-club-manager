import { useState, useCallback, useRef, useEffect } from 'react';
import { SearchService } from '../../services/searchService';
import { SearchSuggestion, EntityType, SearchHistory } from '../../types/search';
import { debounce } from '../../utils/debounce';

export interface UseSearchSuggestionsOptions {
  debounceDelay?: number;
  entityType?: EntityType;
  limit?: number;
  includeHistory?: boolean;
  minQueryLength?: number;
}

export interface UseSearchSuggestionsReturn {
  // State
  suggestions: SearchSuggestion[];
  history: SearchHistory[];
  loading: boolean;
  error: string | null;
  
  // Actions
  getSuggestions: (query: string) => void;
  clearSuggestions: () => void;
  refreshHistory: () => void;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;
}

export const useSearchSuggestions = (
  options: UseSearchSuggestionsOptions = {}
): UseSearchSuggestionsReturn => {
  const {
    debounceDelay = 200,
    entityType = 'all',
    limit = 8,
    includeHistory = true,
    minQueryLength = 1
  } = options;

  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastRequestRef = useRef<{
    query: string;
    timestamp: number;
  } | null>(null);

  const loadHistory = useCallback(() => {
    if (includeHistory) {
      const searchHistory = SearchService.getSearchHistory();
      setHistory(searchHistory);
    }
  }, [includeHistory]);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query || query.trim().length < minQueryLength) {
      setSuggestions([]);
      if (includeHistory) {
        loadHistory();
      }
      return;
    }

    const requestTimestamp = Date.now();
    lastRequestRef.current = {
      query,
      timestamp: requestTimestamp
    };

    setLoading(true);
    setError(null);

    try {
      const response = await SearchService.getSuggestions(query, entityType, limit);
      
      // Check if this is still the latest request
      if (lastRequestRef.current?.timestamp === requestTimestamp) {
        const allSuggestions = [...response.suggestions];

        // Add relevant history items if requested
        if (includeHistory && history.length > 0) {
          const relevantHistory = history
            .filter(item => 
              item.query.toLowerCase().includes(query.toLowerCase()) ||
              query.toLowerCase().includes(item.query.toLowerCase())
            )
            .slice(0, 3) // Limit history suggestions
            .map(item => ({
              text: item.query,
              type: 'query' as const,
              count: item.resultsCount
            }));

          // Merge with suggestions, avoiding duplicates
          const existingTexts = new Set(allSuggestions.map(s => s.text.toLowerCase()));
          const uniqueHistory = relevantHistory.filter(h => 
            !existingTexts.has(h.text.toLowerCase())
          );

          allSuggestions.unshift(...uniqueHistory);
        }

        setSuggestions(allSuggestions.slice(0, limit));
      }
    } catch (err) {
      if (lastRequestRef.current?.timestamp === requestTimestamp) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des suggestions';
        setError(errorMessage);
        setSuggestions([]);
      }
    } finally {
      if (lastRequestRef.current?.timestamp === requestTimestamp) {
        setLoading(false);
      }
    }
  }, [entityType, limit, includeHistory, history, minQueryLength, loadHistory]);

  const debouncedFetchSuggestions = useCallback(
    debounce((query: string) => {
      fetchSuggestions(query);
    }, debounceDelay),
    [fetchSuggestions]
  );

  const getSuggestions = useCallback((query: string) => {
    if (!query || query.trim().length < minQueryLength) {
      setSuggestions([]);
      if (includeHistory) {
        loadHistory();
      }
      return;
    }
    
    debouncedFetchSuggestions(query);
  }, [debouncedFetchSuggestions, minQueryLength, includeHistory, loadHistory]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
    lastRequestRef.current = null;
    debouncedFetchSuggestions.cancel();
  }, [debouncedFetchSuggestions]);

  const refreshHistory = useCallback(() => {
    loadHistory();
  }, [loadHistory]);

  const clearHistory = useCallback(() => {
    SearchService.clearSearchHistory();
    setHistory([]);
  }, []);

  const removeFromHistory = useCallback((id: string) => {
    SearchService.removeSearchFromHistory(id);
    setHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedFetchSuggestions.cancel();
    };
  }, [debouncedFetchSuggestions]);

  return {
    suggestions,
    history,
    loading,
    error,
    getSuggestions,
    clearSuggestions,
    refreshHistory,
    clearHistory,
    removeFromHistory
  };
};