export interface User {
  id: number;
  email: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: number;
  token: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}