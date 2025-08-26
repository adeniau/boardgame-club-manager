import axios from 'axios';
import { AuthService } from './authService';

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

export interface Season {
  id: number;
  year: string;
}

export class SeasonsService {
  static async getAllSeasons(): Promise<Season[]> {
    try {
      const response = await seasonsApi.get<Season[]>('/seasons');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des saisons:', error);
      throw new Error('Erreur lors de la récupération des saisons');
    }
  }

  static async getCurrentSeason(): Promise<Season | null> {
    try {
      const seasons = await this.getAllSeasons();
      // Pour l'instant, retourner la première saison disponible
      // Dans le futur, on pourrait avoir une logique plus sophistiquée
      return seasons.length > 0 ? (seasons[0] || null) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération de la saison courante:', error);
      return null;
    }
  }

  static async createSeason(year: string): Promise<Season> {
    try {
      const response = await seasonsApi.post<Season>('/seasons', { year });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la saison:', error);
      throw new Error('Erreur lors de la création de la saison');
    }
  }
}