import axios from 'axios';
import { AuthService } from './authService';
import { 
  Season, 
  CreateSeasonRequest, 
  UpdateSeasonRequest,
  SeasonStats, 
  SeasonAnalytics,
  SeasonMembership,
  SeasonBorrowing,
  ApiResponse 
} from '../types/seasons';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_KEY = import.meta.env.VITE_API_KEY;

const seasonsApi = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  },
});

// Intercepteur pour ajouter le token JWT automatiquement
seasonsApi.interceptors.request.use((config) => {
  const token = AuthService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer l'expiration du token
seasonsApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      AuthService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export class SeasonsService {
  /**
   * Récupérer toutes les saisons avec comptage des adhésions
   */
  static async getAllSeasons(): Promise<Season[]> {
    try {
      const response = await seasonsApi.get<ApiResponse<Season[]>>('/seasons');
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Erreur lors de la récupération des saisons');
      }
    } catch (error: any) {
      console.error('Erreur lors de la récupération des saisons:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Erreur lors de la récupération des saisons');
    }
  }

  /**
   * Récupérer la saison courante
   */
  static async getCurrentSeason(): Promise<Season | null> {
    try {
      const response = await seasonsApi.get<ApiResponse<Season>>('/seasons/current');
      
      if (response.data.success) {
        return response.data.data;
      } else {
        // Si aucune saison courante n'est définie, retourner null
        return null;
      }
    } catch (error: any) {
      // Si erreur 404 (aucune saison courante), retourner null
      if (error.response?.status === 404) {
        return null;
      }
      
      console.error('Erreur lors de la récupération de la saison courante:', error);
      throw new Error('Erreur lors de la récupération de la saison courante');
    }
  }

  /**
   * Récupérer une saison par ID avec détails
   */
  static async getSeasonById(id: number): Promise<Season> {
    try {
      const response = await seasonsApi.get<ApiResponse<Season>>(`/seasons/${id}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Erreur lors de la récupération de la saison');
      }
    } catch (error: any) {
      console.error(`Erreur lors de la récupération de la saison ${id}:`, error);
      
      if (error.response?.status === 404) {
        throw new Error('Saison non trouvée');
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Erreur lors de la récupération de la saison');
    }
  }

  /**
   * Créer une nouvelle saison
   */
  static async createSeason(seasonData: CreateSeasonRequest): Promise<Season> {
    try {
      const response = await seasonsApi.post<ApiResponse<Season>>('/seasons', seasonData);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Erreur lors de la création de la saison');
      }
    } catch (error: any) {
      console.error('Erreur lors de la création de la saison:', error);
      
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.join(', ');
        throw new Error(`Erreur de validation: ${errorMessages}`);
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Erreur lors de la création de la saison');
    }
  }

  /**
   * Mettre à jour une saison
   */
  static async updateSeason(id: number, seasonData: UpdateSeasonRequest): Promise<Season> {
    try {
      const response = await seasonsApi.put<ApiResponse<Season>>(`/seasons/${id}`, seasonData);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Erreur lors de la mise à jour de la saison');
      }
    } catch (error: any) {
      console.error(`Erreur lors de la mise à jour de la saison ${id}:`, error);
      
      if (error.response?.status === 404) {
        throw new Error('Saison non trouvée');
      }
      
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.join(', ');
        throw new Error(`Erreur de validation: ${errorMessages}`);
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Erreur lors de la mise à jour de la saison');
    }
  }

  /**
   * Définir une saison comme courante
   */
  static async setCurrentSeason(id: number): Promise<Season> {
    try {
      const response = await seasonsApi.put<ApiResponse<Season>>(`/seasons/${id}/set-current`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Erreur lors de la définition de la saison courante');
      }
    } catch (error: any) {
      console.error(`Erreur lors de la définition de la saison courante ${id}:`, error);
      
      if (error.response?.status === 404) {
        throw new Error('Saison non trouvée');
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Erreur lors de la définition de la saison courante');
    }
  }

  /**
   * Supprimer une saison
   */
  static async deleteSeason(id: number): Promise<void> {
    try {
      const response = await seasonsApi.delete<ApiResponse<any>>(`/seasons/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Erreur lors de la suppression de la saison');
      }
    } catch (error: any) {
      console.error(`Erreur lors de la suppression de la saison ${id}:`, error);
      
      if (error.response?.status === 404) {
        throw new Error('Saison non trouvée');
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Erreur lors de la suppression de la saison');
    }
  }

  /**
   * Récupérer les statistiques d'une saison
   */
  static async getSeasonStats(id: number): Promise<SeasonStats> {
    try {
      const response = await seasonsApi.get<ApiResponse<SeasonStats>>(`/seasons/${id}/stats`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Erreur lors de la récupération des statistiques');
      }
    } catch (error: any) {
      console.error(`Erreur lors de la récupération des statistiques de la saison ${id}:`, error);
      
      if (error.response?.status === 404) {
        throw new Error('Saison non trouvée');
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Erreur lors de la récupération des statistiques');
    }
  }

  /**
   * Récupérer les analyses avancées d'une saison
   */
  static async getSeasonAnalytics(id: number): Promise<SeasonAnalytics> {
    try {
      const response = await seasonsApi.get<ApiResponse<SeasonAnalytics>>(`/seasons/${id}/analytics`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Erreur lors de la récupération des analyses');
      }
    } catch (error: any) {
      console.error(`Erreur lors de la récupération des analyses de la saison ${id}:`, error);
      
      if (error.response?.status === 404) {
        throw new Error('Saison non trouvée');
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Erreur lors de la récupération des analyses');
    }
  }

  /**
   * Récupérer les adhésions d'une saison
   */
  static async getSeasonMemberships(id: number): Promise<SeasonMembership[]> {
    try {
      const response = await seasonsApi.get<ApiResponse<SeasonMembership[]>>(`/seasons/${id}/memberships`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Erreur lors de la récupération des adhésions');
      }
    } catch (error: any) {
      console.error(`Erreur lors de la récupération des adhésions de la saison ${id}:`, error);
      
      if (error.response?.status === 404) {
        throw new Error('Saison non trouvée');
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Erreur lors de la récupération des adhésions');
    }
  }

  /**
   * Récupérer les emprunts d'une saison
   */
  static async getSeasonBorrowings(id: number): Promise<SeasonBorrowing[]> {
    try {
      const response = await seasonsApi.get<ApiResponse<SeasonBorrowing[]>>(`/seasons/${id}/borrowings`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Erreur lors de la récupération des emprunts');
      }
    } catch (error: any) {
      console.error(`Erreur lors de la récupération des emprunts de la saison ${id}:`, error);
      
      if (error.response?.status === 404) {
        throw new Error('Saison non trouvée');
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Erreur lors de la récupération des emprunts');
    }
  }

  /**
   * Archiver une saison
   */
  static async archiveSeason(id: number): Promise<Season> {
    try {
      const response = await seasonsApi.post<ApiResponse<Season>>(`/seasons/${id}/archive`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Erreur lors de l\'archivage de la saison');
      }
    } catch (error: any) {
      console.error(`Erreur lors de l'archivage de la saison ${id}:`, error);
      
      if (error.response?.status === 404) {
        throw new Error('Saison non trouvée');
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Erreur lors de l\'archivage de la saison');
    }
  }

  /**
   * Validation côté client pour les formulaires de saison
   */
  static validateSeasonForm(data: CreateSeasonRequest | UpdateSeasonRequest): { 
    isValid: boolean; 
    errors: string[] 
  } {
    const errors: string[] = [];
    
    // Validation du nom (requis pour la création)
    if ('name' in data && data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        errors.push('Le nom de la saison est requis');
      } else if (data.name.trim().length > 100) {
        errors.push('Le nom de la saison ne peut pas dépasser 100 caractères');
      }
    }
    
    // Validation des dates si fournies
    if (data.start_date && data.end_date) {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      
      if (isNaN(startDate.getTime())) {
        errors.push('La date de début n\'est pas valide');
      }
      
      if (isNaN(endDate.getTime())) {
        errors.push('La date de fin n\'est pas valide');
      }
      
      if (startDate >= endDate) {
        errors.push('La date de début doit être antérieure à la date de fin');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Formater une saison pour l'affichage
   */
  static formatSeasonDisplay(season: Season): string {
    if (season.start_date && season.end_date) {
      return `${season.name} (${season.start_date} - ${season.end_date})`;
    }
    return season.name;
  }

  /**
   * Obtenir les options de sélection pour les dropdowns
   */
  static formatSeasonsForSelect(seasons: Season[]): Array<{ value: number; label: string; isCurrent?: boolean }> {
    return seasons.map(season => ({
      value: season.id,
      label: this.formatSeasonDisplay(season),
      isCurrent: season.is_current
    }));
  }
}