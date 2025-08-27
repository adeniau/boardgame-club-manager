import axios from 'axios';
import { AuthService } from './authService';
import { 
  SearchResult,
  SearchResponse,
  SuggestionsResponse,
  SearchOptions,
  SearchHistory,
  EntityType,
  QuickSearchFilters
} from '../types/search';
import { ApiResponse } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_KEY = import.meta.env.VITE_API_KEY;

// Search results cache with TTL
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class SearchCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
}

const searchApi = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  },
});

// Add JWT token to requests
searchApi.interceptors.request.use((config) => {
  const token = AuthService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
searchApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      AuthService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export class SearchService {
  private static searchCache = new SearchCache<SearchResponse>();
  private static suggestionsCache = new SearchCache<SuggestionsResponse>();
  private static readonly SEARCH_HISTORY_KEY = 'bcm_search_history';
  private static readonly MAX_HISTORY_ITEMS = 10;

  // Global search across all entities
  static async globalSearch(query: string, options?: { limit?: number }): Promise<SearchResponse> {
    if (!query || query.trim().length < 2) {
      return {
        results: [],
        totalCount: 0,
        query: query.trim(),
        categories: {
          games: [],
          members: [],
          borrowings: [],
          seasons: []
        }
      };
    }

    const cacheKey = `global:${query.trim()}:${options?.limit || 20}`;
    const cached = this.searchCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const params = new URLSearchParams({
        q: query.trim(),
        ...(options?.limit && { limit: options.limit.toString() })
      });

      const response = await searchApi.get<ApiResponse<SearchResponse>>(
        `/search/global?${params}`
      );

      if (response.data.success && response.data.data) {
        const result = response.data.data;
        this.searchCache.set(cacheKey, result);
        this.saveSearch(query.trim(), result.totalCount);
        return result;
      } else {
        throw new Error(response.data.message || 'Erreur lors de la recherche');
      }
    } catch (error) {
      console.error('Erreur lors de la recherche globale:', error);
      throw new Error('Erreur lors de la recherche globale');
    }
  }

  // Search specific entity type
  static async searchEntity(
    entityType: EntityType,
    query: string,
    filters?: QuickSearchFilters[keyof QuickSearchFilters],
    options?: { limit?: number; offset?: number }
  ): Promise<SearchResponse> {
    if (entityType === 'all') {
      return this.globalSearch(query, options);
    }

    const cacheKey = `${entityType}:${query}:${JSON.stringify(filters)}:${options?.limit || 20}:${options?.offset || 0}`;
    const cached = this.searchCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const params = new URLSearchParams({
        ...(query && { q: query }),
        ...(options?.limit && { limit: options.limit.toString() }),
        ...(options?.offset && { offset: options.offset.toString() })
      });

      // Add entity-specific filters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await searchApi.get<ApiResponse<SearchResponse>>(
        `/search/${entityType}?${params}`
      );

      if (response.data.success && response.data.data) {
        const result = response.data.data;
        this.searchCache.set(cacheKey, result);
        if (query) {
          this.saveSearch(query, result.totalCount);
        }
        return result;
      } else {
        throw new Error(response.data.message || 'Erreur lors de la recherche');
      }
    } catch (error) {
      console.error(`Erreur lors de la recherche ${entityType}:`, error);
      throw new Error(`Erreur lors de la recherche ${entityType}`);
    }
  }

  // Get search suggestions for autocomplete
  static async getSuggestions(
    query: string, 
    entityType: EntityType = 'all',
    limit: number = 8
  ): Promise<SuggestionsResponse> {
    if (!query || query.trim().length < 1) {
      return { suggestions: [], query: query.trim() };
    }

    const cacheKey = `suggestions:${query.trim()}:${entityType}:${limit}`;
    const cached = this.suggestionsCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const params = new URLSearchParams({
        q: query.trim(),
        type: entityType,
        limit: limit.toString()
      });

      const response = await searchApi.get<ApiResponse<SuggestionsResponse>>(
        `/search/suggestions?${params}`
      );

      if (response.data.success && response.data.data) {
        const result = response.data.data;
        // Shorter TTL for suggestions (2 minutes)
        this.suggestionsCache.set(cacheKey, result, 2 * 60 * 1000);
        return result;
      } else {
        return { suggestions: [], query: query.trim() };
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des suggestions:', error);
      return { suggestions: [], query: query.trim() };
    }
  }

  // Search history management
  static getSearchHistory(): SearchHistory[] {
    try {
      const history = localStorage.getItem(this.SEARCH_HISTORY_KEY);
      if (!history) return [];
      
      return JSON.parse(history).map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique de recherche:', error);
      return [];
    }
  }

  static saveSearch(query: string, resultsCount: number): void {
    try {
      const history = this.getSearchHistory();
      
      // Remove existing entry with same query
      const filteredHistory = history.filter(item => 
        item.query.toLowerCase() !== query.toLowerCase()
      );
      
      // Add new entry at the beginning
      const newEntry: SearchHistory = {
        id: Date.now().toString(),
        query,
        timestamp: new Date(),
        resultsCount
      };
      
      const updatedHistory = [newEntry, ...filteredHistory]
        .slice(0, this.MAX_HISTORY_ITEMS);
      
      localStorage.setItem(this.SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la recherche:', error);
    }
  }

  static clearSearchHistory(): void {
    try {
      localStorage.removeItem(this.SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'historique de recherche:', error);
    }
  }

  static removeSearchFromHistory(id: string): void {
    try {
      const history = this.getSearchHistory();
      const updatedHistory = history.filter(item => item.id !== id);
      localStorage.setItem(this.SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Erreur lors de la suppression de la recherche de l\'historique:', error);
    }
  }

  // Cache management
  static clearSearchCache(): void {
    this.searchCache.clear();
    this.suggestionsCache.clear();
  }

  // Advanced search with multiple filters
  static async advancedSearch(options: SearchOptions): Promise<SearchResponse> {
    const { query, filters, limit, offset } = options;
    
    // Use global search if no specific entity filters
    if (!filters?.entityType || filters.entityType.length === 0 || 
        (filters.entityType.length > 1 || filters.entityType[0] === 'all')) {
      return this.globalSearch(query, { limit: limit || undefined });
    }
    
    const entityType = filters.entityType[0] as Exclude<EntityType, 'all'>;
    const entityFilters: any = {};
    
    // Map filters based on entity type
    if (filters.available !== undefined) {
      entityFilters.available = filters.available;
    }
    if (filters.current !== undefined) {
      entityFilters.current = filters.current;
    }
    if (filters.admin !== undefined) {
      entityFilters.admin = filters.admin;
    }
    if (filters.status) {
      entityFilters.status = Array.isArray(filters.status) ? filters.status[0] : filters.status;
    }
    
    return this.searchEntity(entityType, query, entityFilters, { limit: limit || undefined, offset: offset || undefined });
  }

  // Utility methods
  static highlightSearchTerm(text: string, searchTerm: string): string {
    if (!text || !searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  static getEntityTypeLabel(entityType: EntityType): string {
    const labels = {
      games: 'Jeux',
      members: 'Membres', 
      borrowings: 'Emprunts',
      seasons: 'Saisons',
      all: 'Tous'
    };
    return labels[entityType];
  }

  static formatSearchResult(result: SearchResult): string {
    switch (result.type) {
      case 'game':
        return `${result.title} - ${result.description}`;
      case 'member':
        return `${result.title} (${result.description})`;
      case 'borrowing':
        return result.title;
      case 'season':
        return `${result.title} - ${result.description}`;
      default:
        return result.title;
    }
  }
}