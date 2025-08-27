import { useState, useCallback, useEffect } from 'react';
import { SearchService } from '../../services/searchService';
import { SearchHistory } from '../../types/search';

export interface UseSearchHistoryReturn {
  // State
  history: SearchHistory[];
  loading: boolean;
  
  // Actions
  refreshHistory: () => void;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;
  addToHistory: (query: string, resultsCount: number) => void;
}

export const useSearchHistory = (): UseSearchHistoryReturn => {
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [loading, setLoading] = useState(false);

  const loadHistory = useCallback(() => {
    setLoading(true);
    try {
      const searchHistory = SearchService.getSearchHistory();
      setHistory(searchHistory);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique de recherche:', error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const addToHistory = useCallback((query: string, resultsCount: number) => {
    SearchService.saveSearch(query, resultsCount);
    // Refresh history to get the updated list
    refreshHistory();
  }, [refreshHistory]);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    history,
    loading,
    refreshHistory,
    clearHistory,
    removeFromHistory,
    addToHistory
  };
};