export interface Borrowing {
  id: number;
  id_season: number;
  id_member: number;
  id_game: number;
  borrow_date: string;
  return_date: string | null;
  comment: string | null;
}

export interface BorrowingCreateRequest {
  id_season: number;
  id_member: number;
  id_game: number;
  borrow_date: string;
}

export interface BorrowingUpdateRequest {
  return_date?: string | null | undefined;
  comment?: string | null;
}

// Type pour les emprunts avec détails des membres et jeux (vue current_borrowings)
export interface CurrentBorrowing {
  id: number;
  id_season: number;
  id_member: number;
  id_game: number;
  borrow_date: string;
  return_date: string | null;
  comment: string | null;
  
  // Détails du membre
  member_firstname: string;
  member_lastname: string;
  member_email: string;
  member_phone?: string;
  member_picture?: string;
  
  // Détails du jeu  
  game_name: string;
  game_picture?: string;
  game_available: number;
}

// Type pour les formulaires de création d'emprunt
export interface BorrowingFormData {
  selectedMember: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    picture?: string | undefined;
  } | null;
  selectedGame: {
    id: number;
    name: string;
    picture?: string | undefined;
    available: number;
  } | null;
  borrowDate: string;
}

// Type pour les formulaires de retour d'emprunt
export interface ReturnBorrowingFormData {
  comment: string;
}