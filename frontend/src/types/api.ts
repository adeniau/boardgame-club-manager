export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  details?: any;
}