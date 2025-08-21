import axios from 'axios';
import { Member, MemberCreateRequest, MemberUpdateRequest, MemberBorrow } from '../types/members';
import { ApiResponse } from '../types/api';
import { AuthService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_KEY = import.meta.env.VITE_API_KEY;

const membersApi = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  },
});

// Intercepteur pour ajouter le token JWT automatiquement
membersApi.interceptors.request.use((config) => {
  const token = AuthService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer l'expiration du token
membersApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      AuthService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export class MembersService {
  static async getAllMembers(): Promise<Member[]> {
    try {
      const response = await membersApi.get<ApiResponse<Member[]>>('/members');
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Erreur lors de la récupération des membres');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des membres:', error);
      throw new Error('Erreur lors de la récupération des membres');
    }
  }

  static async getMemberById(id: number): Promise<Member> {
    try {
      const response = await membersApi.get<ApiResponse<Member>>(`/members/${id}`);
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Membre non trouvé');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du membre:', error);
      throw new Error('Erreur lors de la récupération du membre');
    }
  }

  static async getMemberBorrows(id: number): Promise<MemberBorrow[]> {
    try {
      const response = await membersApi.get<ApiResponse<MemberBorrow[]>>(`/members/MemberBorrows/${id}`);
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Erreur lors de la récupération de l\'historique');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      throw new Error('Erreur lors de la récupération de l\'historique');
    }
  }

  static async getNewMembersBySeason(seasonId: number): Promise<Member[]> {
    try {
      const response = await membersApi.get<ApiResponse<Member[]>>(`/members/NewMembers/${seasonId}`);
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Erreur lors de la récupération des nouveaux membres');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des nouveaux membres:', error);
      throw new Error('Erreur lors de la récupération des nouveaux membres');
    }
  }

  static async createMember(memberData: MemberCreateRequest, imageFile?: File): Promise<Member> {
    try {
      const formData = new FormData();
      formData.append('name', memberData.name);
      formData.append('firstname', memberData.firstname);
      formData.append('adress', memberData.adress);
      formData.append('postal_code', String(memberData.postal_code));
      formData.append('city', memberData.city);
      formData.append('email', memberData.email);
      formData.append('birth_date', memberData.birth_date);
      formData.append('phone_number', memberData.phone_number);
      formData.append('discord_tag', memberData.discord_tag || '');
      formData.append('admin', memberData.admin || '0');
      
      if (memberData.admin_password) {
        formData.append('admin_password', memberData.admin_password);
      }
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await axios.post<ApiResponse<any>>(
        `${API_BASE_URL}/api/members`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-api-key': API_KEY,
            Authorization: `Bearer ${AuthService.getToken()}`,
          },
        }
      );

      if (response.data.success && response.data.data) {
        // Si c'est un objet avec insertId, on fait un appel pour récupérer le membre créé
        const memberData = response.data.data;
        if (memberData.insertId) {
          return await this.getMemberById(memberData.insertId);
        }
        return memberData;
      } else {
        throw new Error(response.data.message || 'Erreur lors de la création du membre');
      }
    } catch (error) {
      console.error('Erreur lors de la création du membre:', error);
      throw new Error('Erreur lors de la création du membre');
    }
  }

  static async updateMember(id: number, memberData: MemberUpdateRequest, currentMember?: Member, imageFile?: File, removeImage?: boolean): Promise<Member> {
    try {
      const formData = new FormData();
      formData.append('name', memberData.name);
      formData.append('firstname', memberData.firstname);
      formData.append('adress', memberData.adress);
      formData.append('postal_code', String(memberData.postal_code));
      formData.append('city', memberData.city);
      formData.append('email', memberData.email);
      formData.append('birth_date', memberData.birth_date);
      formData.append('phone_number', memberData.phone_number);
      formData.append('discord_tag', memberData.discord_tag || '');
      formData.append('admin', memberData.admin || currentMember?.admin || '0');
      
      if (memberData.admin_password) {
        formData.append('admin_password', memberData.admin_password);
      }
      
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (removeImage) {
        formData.append('removeImage', 'true');
      }

      const response = await axios.put<ApiResponse<any>>(
        `${API_BASE_URL}/api/members/${id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-api-key': API_KEY,
            Authorization: `Bearer ${AuthService.getToken()}`,
          },
        }
      );

      if (response.data.success) {
        // Après la mise à jour, récupérer le membre mis à jour
        return await this.getMemberById(id);
      } else {
        throw new Error(response.data.message || 'Erreur lors de la modification du membre');
      }
    } catch (error) {
      console.error('Erreur lors de la modification du membre:', error);
      throw new Error('Erreur lors de la modification du membre');
    }
  }

  static async deleteMember(id: number): Promise<void> {
    try {
      const response = await membersApi.delete<ApiResponse<any>>(`/members/${id}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Erreur lors de la suppression du membre');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du membre:', error);
      throw new Error('Erreur lors de la suppression du membre');
    }
  }

  static getImageUrl(imagePath?: string): string {
    if (!imagePath) {
      return '/placeholder-game.jpg'; // Utiliser le même placeholder pour l'instant
    }
    
    // Si c'est déjà une URL relative (nouveau format), pointer vers le backend
    if (imagePath.startsWith('/images/')) {
      return `${API_BASE_URL}${imagePath}`;
    }
    
    // Si l'image path est une URL complète du backend (backward compatibility)
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Si c'est juste un nom de fichier (backward compatibility)
    return `${API_BASE_URL}/images/${imagePath}`;
  }
}