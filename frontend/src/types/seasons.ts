// Interface principale pour une saison
export interface Season {
  id: number;
  name: string;
  description?: string | null;
  start_date?: string | null; // Format ISO date string
  end_date?: string | null; // Format ISO date string
  is_current: boolean;
  is_archived?: boolean;
  created_at: string;
  updated_at: string;
  member_count?: number; // Compte des adhesions (ajouté par les requêtes avec JOIN)
  borrowing_count?: number; // Compte des emprunts (ajouté par les requêtes avec JOIN)
}

// Interface pour la création d'une saison
export interface CreateSeasonRequest {
  name: string;
  description?: string;
  start_date?: string; // Format YYYY-MM-DD
  end_date?: string; // Format YYYY-MM-DD
  set_as_current?: boolean;
}

// Interface pour la mise à jour d'une saison
export interface UpdateSeasonRequest {
  name?: string;
  description?: string | null;
  start_date?: string | null; // Format YYYY-MM-DD
  end_date?: string | null; // Format YYYY-MM-DD
}

// Interface pour les statistiques d'une saison
export interface SeasonStats {
  totalMembers: number;
  totalBorrowings: number;
  activeBorrowings: number;
  popularGames: Array<{
    id: number;
    game_name: string;
    borrow_count: number;
  }>;
  activeMembers: Array<{
    id: number;
    member_lastname: string;
    member_firstname: string;
    borrow_count: number;
  }>;
  newMembers: number;
}

// Interface pour les analyses avancées d'une saison
export interface SeasonAnalytics extends SeasonStats {
  monthlyBorrowings: Array<{
    year: number;
    month: number;
    borrow_count: number;
  }>;
  returnRate: number; // Pourcentage de retour des emprunts
}

// Interface pour les adhésions d'une saison
export interface SeasonMembership {
  id: number; // ID du membre
  name: string;
  firstname: string;
  email: string;
  phone_number: string;
  picture: string;
  deposit: number; // 0 ou 1 pour indiquer si la caution est payée
  id_season: number;
}

// Interface pour les emprunts d'une saison
export interface SeasonBorrowing {
  id: number; // ID de l'emprunt
  borrow_date: string;
  return_date?: string | null;
  comment?: string | null;
  member_lastname: string;
  member_firstname: string;
  game_name: string;
}

// Interface pour les filtres d'analyses
export interface AnalyticsFilters {
  include_archived?: boolean;
  date_range?: 'current' | 'last_year' | 'all';
}

// Interface pour les réponses d'erreur de validation
export interface ValidationError {
  field?: string;
  message: string;
}

// Interface pour les réponses API génériques
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: ValidationError[];
}

// Types utilitaires pour les formulaires
export type SeasonFormData = CreateSeasonRequest | UpdateSeasonRequest;

// Énumération pour les statuts d'une saison
export enum SeasonStatus {
  CURRENT = 'current',
  ARCHIVED = 'archived',
  ACTIVE = 'active'
}

// Interface pour les options de sélection d'une saison (pour les dropdowns)
export interface SeasonSelectOption {
  value: number;
  label: string;
  isDisabled?: boolean;
  isCurrent?: boolean;
}

// Interface pour les données de dashboard liées aux saisons
export interface SeasonDashboardData {
  currentSeason: Season | null;
  totalSeasons: number;
  seasonsWithActiveMembers: number;
  recentActivity: {
    recentBorrowings: number;
    activeMemberships: number;
    popularGamesThisSeason: Array<{
      game_name: string;
      borrow_count: number;
    }>;
  };
}