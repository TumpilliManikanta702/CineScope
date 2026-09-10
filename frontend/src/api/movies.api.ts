import { apiClient } from './client';
import { Movie, MovieDetails, Genre, PaginatedResponse, SearchFilters } from '../types';

export const moviesApi = {
  getTrending: async (timeWindow: 'day' | 'week' = 'week', page: number = 1): Promise<PaginatedResponse<Movie>> => {
    const response = await apiClient.get('/movies/trending', {
      params: { timeWindow, page }
    });
    return response.data;
  },

  getPopular: async (page: number = 1): Promise<PaginatedResponse<Movie>> => {
    const response = await apiClient.get('/movies/popular', {
      params: { page }
    });
    return response.data;
  },

  getTopRated: async (page: number = 1): Promise<PaginatedResponse<Movie>> => {
    const response = await apiClient.get('/movies/top-rated', {
      params: { page }
    });
    return response.data;
  },

  getNowPlaying: async (page: number = 1): Promise<PaginatedResponse<Movie>> => {
    const response = await apiClient.get('/movies/now-playing', {
      params: { page }
    });
    return response.data;
  },

  getUpcoming: async (page: number = 1): Promise<PaginatedResponse<Movie>> => {
    const response = await apiClient.get('/movies/upcoming', {
      params: { page }
    });
    return response.data;
  },

  searchMovies: async (filters: Partial<SearchFilters>, signal?: AbortSignal): Promise<PaginatedResponse<Movie>> => {
    const response = await apiClient.get('/movies/search', {
      params: {
        q: filters.q || '',
        page: filters.page || 1,
        genre: filters.genre || undefined,
        year: filters.year || undefined,
        rating: filters.rating || undefined,
        language: filters.language || undefined,
        sort: filters.sort || undefined
      },
      signal
    });
    return response.data;
  },

  getMovieDetails: async (id: number): Promise<MovieDetails> => {
    const response = await apiClient.get(`/movies/${id}`);
    return response.data.data;
  },

  getGenres: async (): Promise<Genre[]> => {
    const response = await apiClient.get('/genres');
    return response.data.data;
  }
};
