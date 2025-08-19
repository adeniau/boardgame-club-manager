export interface Game {
  id: number;
  name: string;
  picture?: string;
  available: number | string; // 0 = emprunté, 1 = disponible (peut être string ou number)
  created_at?: string;
  updated_at?: string;
}

export interface GameFormData {
  name: string;
  picture?: File | undefined;
}

export interface GameCreateRequest {
  name: string;
  available?: number;
}

export interface GameUpdateRequest {
  name: string;
  available?: number;
}

export interface GameBorrow {
  id: number;
  id_game: number;
  id_member: number;
  id_season: number;
  borrow_date: string;
  return_date?: string;
  comment?: string;
  game_name?: string;
  member_name?: string;
}

export interface GameFilters {
  search: string;
  availability: 'all' | 'available' | 'borrowed';
}

export interface GameListResponse {
  games: Game[];
  total: number;
  page: number;
  limit: number;
}