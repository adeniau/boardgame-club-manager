import axios from 'axios';
import { 
  Borrowing, 
  BorrowingCreateRequest, 
  BorrowingUpdateRequest, 
  CurrentBorrowing,
  BorrowingHistoryItem,
  BorrowingHistoryFilters,
  ApiResponse
} from '../types/borrowings';
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
      const response = await axios.get<ApiResponse<CurrentBorrowing[]> | CurrentBorrowing[]>(
        `${API_BASE_URL}/api/borrowings/CurrentBorrowings`,
        {
          headers: {
            'x-api-key': API_KEY,
          },
        }
      );
      
      // Gerer le nouveau format de reponse API {success, message, data}
      if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        const apiResponse = response.data as ApiResponse<CurrentBorrowing[]>;
        if (apiResponse.success) {
          return apiResponse.data;
        } else {
          throw new Error(apiResponse.message || 'Erreur lors de la récupération des emprunts en cours');
        }
      }
      
      // Compatibilite avec l'ancien format
      return response.data as CurrentBorrowing[];
    } catch (error) {
      console.error('Erreur lors de la récupération des emprunts en cours:', error);
      throw new Error('Erreur lors de la récupération des emprunts en cours');
    }
  }

  static async getBorrowingsByMember(memberId: number): Promise<Borrowing[]> {
    try {
      const response = await borrowingsApi.get<ApiResponse<Borrowing[]> | Borrowing[]>(`/borrowings/ByMember/${memberId}`);
      
      // Gerer le nouveau format de reponse API {success, message, data}
      if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        const apiResponse = response.data as ApiResponse<Borrowing[]>;
        if (apiResponse.success) {
          return apiResponse.data;
        } else {
          throw new Error(apiResponse.message || 'Erreur lors de la récupération des emprunts du membre');
        }
      }
      
      // Compatibilite avec l'ancien format
      return response.data as Borrowing[];
    } catch (error) {
      console.error('Erreur lors de la récupération des emprunts du membre:', error);
      throw new Error('Erreur lors de la récupération des emprunts du membre');
    }
  }

  static async getBorrowingsByGame(gameId: number): Promise<Borrowing[]> {
    try {
      const response = await borrowingsApi.get<ApiResponse<Borrowing[]> | Borrowing[]>(`/borrowings/ByGame/${gameId}`);
      
      // Gerer le nouveau format de reponse API {success, message, data}
      if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        const apiResponse = response.data as ApiResponse<Borrowing[]>;
        if (apiResponse.success) {
          return apiResponse.data;
        } else {
          throw new Error(apiResponse.message || 'Erreur lors de la récupération des emprunts du jeu');
        }
      }
      
      // Compatibilite avec l'ancien format
      return response.data as Borrowing[];
    } catch (error) {
      console.error('Erreur lors de la récupération des emprunts du jeu:', error);
      throw new Error('Erreur lors de la récupération des emprunts du jeu');
    }
  }

  static async getBorrowingsHistory(filters?: BorrowingHistoryFilters): Promise<BorrowingHistoryItem[]> {
    try {
      // Construire les parametres de requete
      const params = new URLSearchParams();
      
      if (filters?.memberId) params.append('member_id', filters.memberId.toString());
      if (filters?.gameId) params.append('game_id', filters.gameId.toString());
      if (filters?.seasonId) params.append('season_id', filters.seasonId.toString());
      if (filters?.status) params.append('status', filters.status);
      if (filters?.dateFrom) params.append('date_from', filters.dateFrom);
      if (filters?.dateTo) params.append('date_to', filters.dateTo);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const queryString = params.toString();
      const url = `/borrowings/History${queryString ? `?${queryString}` : ''}`;
      
      const response = await borrowingsApi.get<ApiResponse<BorrowingHistoryItem[]> | BorrowingHistoryItem[]>(url);
      
      // Gerer le nouveau format de reponse API {success, message, data}
      if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        const apiResponse = response.data as ApiResponse<BorrowingHistoryItem[]>;
        if (apiResponse.success) {
          return apiResponse.data;
        } else {
          throw new Error(apiResponse.message || 'Erreur lors de la récupération de l\'historique des emprunts');
        }
      }
      
      // Compatibilite avec l'ancien format
      return response.data as BorrowingHistoryItem[];
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique des emprunts:', error);
      throw new Error('Erreur lors de la récupération de l\'historique des emprunts');
    }
  }

  static async getTotalBorrowings(seasonId: number): Promise<any[]> {
    try {
      const response = await borrowingsApi.get<ApiResponse<any[]> | any[]>(`/borrowings/TotalBorrowings/${seasonId}`);
      
      // Gerer le nouveau format de reponse API {success, message, data}
      if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        const apiResponse = response.data as ApiResponse<any[]>;
        if (apiResponse.success) {
          return apiResponse.data;
        } else {
          throw new Error(apiResponse.message || 'Erreur lors de la récupération des statistiques d\'emprunts');
        }
      }
      
      // Compatibilite avec l'ancien format
      return response.data as any[];
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques d\'emprunts:', error);
      throw new Error('Erreur lors de la récupération des statistiques d\'emprunts');
    }
  }

  static async getTotalGamesBorrowings(seasonId: number): Promise<any[]> {
    try {
      const response = await borrowingsApi.get<ApiResponse<any[]> | any[]>(`/borrowings/TotalGames/${seasonId}`);
      
      // Gerer le nouveau format de reponse API {success, message, data}
      if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        const apiResponse = response.data as ApiResponse<any[]>;
        if (apiResponse.success) {
          return apiResponse.data;
        } else {
          throw new Error(apiResponse.message || 'Erreur lors de la récupération des statistiques de jeux');
        }
      }
      
      // Compatibilite avec l'ancien format
      return response.data as any[];
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques de jeux:', error);
      throw new Error('Erreur lors de la récupération des statistiques de jeux');
    }
  }

  static async createBorrowing(borrowingData: BorrowingCreateRequest): Promise<Borrowing> {
    try {
      const response = await borrowingsApi.post<ApiResponse<any> | any>('/borrowings', borrowingData);
      
      // Gerer le nouveau format de reponse API {success, message, data}
      if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        const apiResponse = response.data as ApiResponse<any>;
        if (apiResponse.success) {
          const data = apiResponse.data;
          if (data && data.insertId) {
            return {
              id: data.insertId,
              id_season: borrowingData.id_season,
              id_member: borrowingData.id_member,
              id_game: borrowingData.id_game,
              borrow_date: borrowingData.borrow_date,
              return_date: null,
              comment: null,
            };
          }
          return data;
        } else {
          throw new Error(apiResponse.message || 'Erreur lors de la création de l\'emprunt');
        }
      }
      
      // Compatibilite avec l'ancien format
      const legacyData = response.data as any;
      if (legacyData.insertId) {
        return {
          id: legacyData.insertId,
          id_season: borrowingData.id_season,
          id_member: borrowingData.id_member,
          id_game: borrowingData.id_game,
          borrow_date: borrowingData.borrow_date,
          return_date: null,
          comment: null,
        };
      }
      
      return legacyData;
    } catch (error) {
      console.error('Erreur lors de la création de l\'emprunt:', error);
      throw new Error('Erreur lors de la création de l\'emprunt');
    }
  }

  static async updateBorrowing(id: number, borrowingData: BorrowingUpdateRequest): Promise<void> {
    try {
      const response = await borrowingsApi.put<ApiResponse<any> | any>(`/borrowings/${id}`, borrowingData);
      
      // Gerer le nouveau format de reponse API {success, message, data}
      if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        const apiResponse = response.data as ApiResponse<any>;
        if (!apiResponse.success) {
          throw new Error(apiResponse.message || 'Erreur lors de la modification de l\'emprunt');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la modification de l\'emprunt:', error);
      throw new Error('Erreur lors de la modification de l\'emprunt');
    }
  }

  static async deleteBorrowing(id: number): Promise<void> {
    try {
      const response = await borrowingsApi.delete<ApiResponse<any> | any>(`/borrowings/${id}`);
      
      // Gerer le nouveau format de reponse API {success, message, data}
      if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        const apiResponse = response.data as ApiResponse<any>;
        if (!apiResponse.success) {
          throw new Error(apiResponse.message || 'Erreur lors de la suppression de l\'emprunt');
        }
      }
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

  static async getBorrowingStats(): Promise<any> {
    try {
      const response = await borrowingsApi.get<ApiResponse<any> | any>('/borrowings/Stats');
      
      // Gerer le nouveau format de reponse API {success, message, data}
      if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        const apiResponse = response.data as ApiResponse<any>;
        if (apiResponse.success) {
          return apiResponse.data;
        } else {
          throw new Error(apiResponse.message || 'Erreur lors de la récupération des statistiques');
        }
      }
      
      // Compatibilite avec l'ancien format
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw new Error('Erreur lors de la récupération des statistiques');
    }
  }

  static async getOverdueBorrowings(threshold: number = 14): Promise<any[]> {
    try {
      const response = await borrowingsApi.get<ApiResponse<any[]> | any[]>(`/borrowings/Overdue?threshold=${threshold}`);
      
      // Gerer le nouveau format de reponse API {success, message, data}
      if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        const apiResponse = response.data as ApiResponse<any[]>;
        if (apiResponse.success) {
          return apiResponse.data;
        } else {
          throw new Error(apiResponse.message || 'Erreur lors de la récupération des emprunts en retard');
        }
      }
      
      // Compatibilite avec l'ancien format
      return response.data as any[];
    } catch (error) {
      console.error('Erreur lors de la récupération des emprunts en retard:', error);
      throw new Error('Erreur lors de la récupération des emprunts en retard');
    }
  }
}