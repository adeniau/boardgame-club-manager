import axios from 'axios';
import { Borrowing, BorrowingCreateRequest, BorrowingUpdateRequest, CurrentBorrowing } from '../types/borrowings';
import { AuthService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_KEY = import.meta.env.VITE_API_KEY;

const borrowingsApi = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  },
});

// Intercepteur pour ajouter le token JWT automatiquement
borrowingsApi.interceptors.request.use((config) => {
  const token = AuthService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer l'expiration du token
borrowingsApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      AuthService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export class BorrowingsService {
  static async getCurrentBorrowings(): Promise<CurrentBorrowing[]> {
    try {
      const response = await axios.get<CurrentBorrowing[]>(
        `${API_BASE_URL}/api/borrowings/CurrentBorrowings`,
        {
          headers: {
            'x-api-key': API_KEY,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des emprunts en cours:', error);
      throw new Error('Erreur lors de la récupération des emprunts en cours');
    }
  }

  static async getBorrowingsByMember(memberId: number): Promise<Borrowing[]> {
    try {
      const response = await borrowingsApi.get<Borrowing[]>(`/borrowings/ByMember/${memberId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des emprunts du membre:', error);
      throw new Error('Erreur lors de la récupération des emprunts du membre');
    }
  }

  static async getBorrowingsByGame(gameId: number): Promise<Borrowing[]> {
    try {
      const response = await borrowingsApi.get<Borrowing[]>(`/borrowings/ByGame/${gameId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des emprunts du jeu:', error);
      throw new Error('Erreur lors de la récupération des emprunts du jeu');
    }
  }

  static async getTotalBorrowings(seasonId: number): Promise<any[]> {
    try {
      const response = await borrowingsApi.get<any[]>(`/borrowings/TotalBorrowings/${seasonId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques d\'emprunts:', error);
      throw new Error('Erreur lors de la récupération des statistiques d\'emprunts');
    }
  }

  static async getTotalGamesBorrowings(seasonId: number): Promise<any[]> {
    try {
      const response = await borrowingsApi.get<any[]>(`/borrowings/TotalGames/${seasonId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques de jeux:', error);
      throw new Error('Erreur lors de la récupération des statistiques de jeux');
    }
  }

  static async createBorrowing(borrowingData: BorrowingCreateRequest): Promise<Borrowing> {
    try {
      const response = await borrowingsApi.post<any>('/borrowings', borrowingData);
      
      if (response.data.insertId) {
        // Si la réponse contient un insertId, créer un objet Borrowing
        return {
          id: response.data.insertId,
          id_season: borrowingData.id_season,
          id_member: borrowingData.id_member,
          id_game: borrowingData.id_game,
          borrow_date: borrowingData.borrow_date,
          return_date: null,
          comment: null,
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'emprunt:', error);
      throw new Error('Erreur lors de la création de l\'emprunt');
    }
  }

  static async updateBorrowing(id: number, borrowingData: BorrowingUpdateRequest): Promise<void> {
    try {
      await borrowingsApi.put(`/borrowings/${id}`, borrowingData);
    } catch (error) {
      console.error('Erreur lors de la modification de l\'emprunt:', error);
      throw new Error('Erreur lors de la modification de l\'emprunt');
    }
  }

  static async deleteBorrowing(id: number): Promise<void> {
    try {
      await borrowingsApi.delete(`/borrowings/${id}`);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'emprunt:', error);
      throw new Error('Erreur lors de la suppression de l\'emprunt');
    }
  }

  static async returnBorrowing(id: number, comment?: string): Promise<void> {
    try {
      const returnData: BorrowingUpdateRequest = {
        return_date: new Date().toISOString().split('T')[0], // Format YYYY-MM-DD
        comment: comment || null,
      };
      
      await this.updateBorrowing(id, returnData);
    } catch (error) {
      console.error('Erreur lors du retour de l\'emprunt:', error);
      throw new Error('Erreur lors du retour de l\'emprunt');
    }
  }
}