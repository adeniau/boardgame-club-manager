export interface Member {
  id: number;
  name: string;
  firstname: string;
  adress: string;
  postal_code: number;
  city: string;
  email: string;
  birth_date: string;
  phone_number: string;
  picture: string;
  discord_tag: string;
  admin: string; // "0" ou "1" pour compatibilité backend
}

export interface MemberCreateRequest {
  name: string;
  firstname: string;
  adress: string;
  postal_code: number;
  city: string;
  email: string;
  birth_date: string;
  phone_number: string;
  discord_tag?: string;
  admin?: string;
  admin_password?: string;
}

export interface MemberUpdateRequest extends MemberCreateRequest {
  // Hérite de tous les champs de MemberCreateRequest
}

export interface MemberBorrow {
  id: number;
  id_season: number;
  id_member: number;
  id_game: number;
  borrow_date: string;
  return_date?: string;
  comment?: string;
  // Champs supplémentaires des vues SQL
  game_name?: string;
  season_year?: string;
}

export interface MemberStats {
  total_borrows: number;
  current_borrows: number;
  average_borrow_duration?: number;
}