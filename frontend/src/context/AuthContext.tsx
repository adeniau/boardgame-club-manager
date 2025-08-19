import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, AuthContextType, LoginCredentials } from '../types/auth';
import { AuthService } from '../services/authService';

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: AuthState['user']; token: string } }
  | { type: 'LOGIN_ERROR' }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGIN_ERROR':
      return { ...state, isLoading: false };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = AuthService.getToken();
        const user = AuthService.getUser();

        if (token && user && AuthService.isTokenValid()) {
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user, token },
          });
        } else {
          AuthService.logout();
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch {
        AuthService.logout();
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await AuthService.login(credentials);
      const user = { id: response.userId, email: credentials.email };
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token: response.token },
      });
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR' });
      throw error;
    }
  };

  const logout = (): void => {
    AuthService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const refreshToken = async (): Promise<void> => {
    try {
      await AuthService.refreshToken();
    } catch {
      logout();
    }
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}