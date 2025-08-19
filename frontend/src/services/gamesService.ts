import axios from 'axios';
import { Game, GameCreateRequest, GameUpdateRequest } from '../types/games';
import { AuthService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_KEY = import.meta.env.VITE_API_KEY;

const gamesApi = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  },
});

// Intercepteur pour ajouter le token JWT automatiquement
gamesApi.interceptors.request.use((config) => {
  const token = AuthService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer l'expiration du token
gamesApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      AuthService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export class GamesService {
  static async getAllGames(): Promise<Game[]> {
    try {
      const response = await gamesApi.get<Game[]>('/games');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des jeux:', error);
      throw new Error('Erreur lors de la récupération des jeux');
    }
  }

  static async getGameById(id: number): Promise<Game> {
    try {
      const response = await gamesApi.get<Game[]>(`/games/${id}`);
      if (response.data.length === 0) {
        throw new Error('Jeu non trouvé');
      }
      const game = response.data[0];
      if (!game) {
        throw new Error('Jeu non trouvé');
      }
      return game;
    } catch (error) {
      console.error('Erreur lors de la récupération du jeu:', error);
      throw new Error('Erreur lors de la récupération du jeu');
    }
  }

  static async getRandomGame(): Promise<Game> {
    try {
      const response = await gamesApi.get<Game[]>('/games/Random');
      if (response.data.length === 0) {
        throw new Error('Aucun jeu trouvé');
      }
      const game = response.data[0];
      if (!game) {
        throw new Error('Aucun jeu trouvé');
      }
      return game;
    } catch (error) {
      console.error('Erreur lors de la récupération du jeu aléatoire:', error);
      throw new Error('Erreur lors de la récupération du jeu aléatoire');
    }
  }

  static async createGame(gameData: GameCreateRequest, imageFile?: File): Promise<Game> {
    try {
      const formData = new FormData();
      formData.append('name', gameData.name);
      formData.append('available', String(gameData.available ?? 1));
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/games`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-api-key': API_KEY,
            Authorization: `Bearer ${AuthService.getToken()}`,
          },
        }
      );

      // L'API peut retourner un objet ou un array, on gère les deux cas
      const game = Array.isArray(response.data) ? response.data[0] : response.data;
      if (!game) {
        throw new Error('Réponse invalide du serveur');
      }
      return game;
    } catch (error) {
      console.error('Erreur lors de la création du jeu:', error);
      throw new Error('Erreur lors de la création du jeu');
    }
  }

  static async updateGame(id: number, gameData: GameUpdateRequest, currentGame?: Game, imageFile?: File, removeImage?: boolean): Promise<Game> {
    try {
      const formData = new FormData();
      formData.append('name', gameData.name);
      formData.append('available', String(gameData.available ?? currentGame?.available ?? 1));
      
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (removeImage) {
        formData.append('removeImage', 'true');
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/games/${id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-api-key': API_KEY,
            Authorization: `Bearer ${AuthService.getToken()}`,
          },
        }
      );

      // L'API peut retourner un objet ou un array, on gère les deux cas
      const game = Array.isArray(response.data) ? response.data[0] : response.data;
      if (!game) {
        throw new Error('Réponse invalide du serveur');
      }
      return game;
    } catch (error) {
      console.error('Erreur lors de la modification du jeu:', error);
      throw new Error('Erreur lors de la modification du jeu');
    }
  }

  static async deleteGame(id: number): Promise<void> {
    try {
      await gamesApi.delete(`/games/${id}`);
    } catch (error) {
      console.error('Erreur lors de la suppression du jeu:', error);
      throw new Error('Erreur lors de la suppression du jeu');
    }
  }


  static getImageUrl(imagePath?: string): string {
    if (!imagePath) {
      return '/placeholder-game.jpg'; // Placeholder servi directement par nginx
    }
    
    // Si c'est déjà une URL relative (nouveau format), pointer vers le backend
    if (imagePath.startsWith('/images/')) {
      return `${API_BASE_URL}${imagePath}`;
    }
    
    // Si l'image path est une URL complète du backend (backward compatibility)
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath; // Déjà une URL complète
    }
    
    // Si c'est juste un nom de fichier (backward compatibility)
    return `${API_BASE_URL}/images/${imagePath}`;
  }
}