export interface SearchResult {
  id: string;
  type: 'game' | 'member' | 'borrowing' | 'season';
  title: string;
  description: string;
  score: number;
  metadata: GameMetadata | MemberMetadata | BorrowingMetadata | SeasonMetadata;
}

export interface GameMetadata {
  available: string;
  picture?: string;
  name: string;
}

export interface MemberMetadata {
  isAdmin: boolean;
  picture?: string;
  email: string;
  name: string;
  firstname: string;
}

export interface BorrowingMetadata {
  memberName: string;
  gameName: string;
  seasonName: string;
  isActive: boolean;
  comment?: string;
  gamePicture?: string;
  borrowDate: string;
  returnDate?: string;
}

export interface SeasonMetadata {
  isCurrent: boolean;
  startDate: string;
  endDate: string;
  description?: string;
  name: string;
}

export interface SearchFilters {
  entityType?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  status?: string[];
  available?: boolean;
  current?: boolean;
  admin?: boolean;
  limit?: number;
  offset?: number;
}

export interface SearchSuggestion {
  text: string;
  type: 'query' | 'entity';
  entityType?: 'game' | 'member' | 'borrowing' | 'season';
  count?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  query: string;
  filters?: Record<string, any>;
  categories?: {
    games: SearchResult[];
    members: SearchResult[];
    borrowings: SearchResult[];
    seasons: SearchResult[];
  };
}

export interface SuggestionsResponse {
  suggestions: SearchSuggestion[];
  query: string;
}

export interface SearchOptions {
  query: string;
  filters?: SearchFilters;
  limit?: number;
  offset?: number;
}

export interface SearchHistory {
  id: string;
  query: string;
  timestamp: Date;
  resultsCount: number;
}

export interface QuickSearchFilters {
  games?: {
    available?: boolean;
  };
  members?: {
    admin?: boolean;
  };
  borrowings?: {
    status?: 'active' | 'returned';
  };
  seasons?: {
    current?: boolean;
  };
}

export type EntityType = 'games' | 'members' | 'borrowings' | 'seasons' | 'all';

export interface AdvancedSearchFilters extends SearchFilters {
  games?: {
    available?: boolean;
    name?: string;
  };
  members?: {
    admin?: boolean;
    name?: string;
    email?: string;
  };
  borrowings?: {
    status?: 'active' | 'returned';
    memberName?: string;
    gameName?: string;
    dateRange?: {
      from: Date;
      to: Date;
    };
  };
  seasons?: {
    current?: boolean;
    name?: string;
    dateRange?: {
      from: Date;
      to: Date;
    };
  };
}