import { Document, Types } from 'mongoose';

// ==========================================
// MOVIE DATA CONTRACTS (NORMALIZED)
// ==========================================

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
  rating: number; // Normalized 0-10 with 1 decimal place
  voteCount: number;
  releaseDate: string | null;
  releaseYear: number | null;
  genreIds: number[];
  genres?: string[];
  popularity?: number;
  originalLanguage?: string;
}

export interface MovieDetails extends Movie {
  runtime: number | null; // In minutes
  tagline: string | null;
  status: string;
  genres: string[];
  genreObjects: Genre[];
  cast: CastMember[];
  recommendations: Movie[];
  similar: Movie[];
}

export interface PaginatedResponse<T> {
  page: number;
  totalPages: number;
  totalResults: number;
  results: T[];
}

// ==========================================
// USER & WISHLIST CONTRACTS
// ==========================================

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface IWishlist extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  movieId: number;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  overview: string;
  rating: number;
  releaseDate: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WishlistItemResponse {
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

export interface AuthTokens {
  token: string;
  user: UserResponse;
}

// ==========================================
// API ENVELOPE CONTRACT
// ==========================================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    cached?: boolean;
    page?: number;
    totalPages?: number;
    totalResults?: number;
  };
}
