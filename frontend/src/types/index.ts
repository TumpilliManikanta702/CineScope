export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profileUrl: string | null;
}

export interface Movie {
  id: number;
  title: string;
  originalTitle?: string;
  overview: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  rating: number;
  voteCount: number;
  releaseDate: string | null;
  releaseYear: number | null;
  genreIds: number[];
  genres?: string[];
  popularity?: number;
  originalLanguage?: string;
}

export interface MovieDetails extends Movie {
  runtime: number | null;
  tagline: string | null;
  status: string;
  genres: string[];
  genreObjects: Genre[];
  cast: CastMember[];
  recommendations: Movie[];
  similar: Movie[];
}

export interface PaginatedMeta {
  page: number;
  totalPages: number;
  totalResults: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginatedMeta;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  movieId: number;
  title: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  overview: string;
  rating: number;
  releaseDate: string | null;
  createdAt: string;
}

export interface SearchFilters {
  q: string;
  genre?: string;
  year?: string;
  rating?: string;
  language?: string;
  sort?: string;
  page: number;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}
