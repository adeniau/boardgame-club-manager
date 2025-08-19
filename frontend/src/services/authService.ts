import axios from 'axios';
import { LoginCredentials, LoginResponse, User } from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_KEY = import.meta.env.VITE_API_KEY;

const authApi = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  },
});

export class AuthService {
  private static TOKEN_KEY = 'bcm_token';
  private static USER_KEY = 'bcm_user';

  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await authApi.post<LoginResponse>('/user/login', credentials);
      const { userId, token } = response.data;
      
      this.setToken(token);
      this.setUser({ id: userId, email: credentials.email });
      
      return response.data;
    } catch (error) {
      throw new Error('Échec de la connexion. Vérifiez vos identifiants.');
    }
  }

  static logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  static setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const parts = token.split('.');
      if (parts.length !== 3 || !parts[1]) return false;
      
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  static async refreshToken(): Promise<void> {
    // Backend ne supporte pas encore le refresh automatique
    // Rediriger vers login si token expiré
    if (!this.isTokenValid()) {
      this.logout();
      throw new Error('Token expiré');
    }
  }
}