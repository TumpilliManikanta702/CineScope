import { apiClient } from './client';
import { WishlistItem, Movie } from '../types';

export const wishlistApi = {
  getWishlist: async (): Promise<WishlistItem[]> => {
    const response = await apiClient.get('/wishlist');
    return response.data.data;
  },

  addToWishlist: async (movie: Movie): Promise<WishlistItem> => {
    const response = await apiClient.post('/wishlist', {
      movieId: movie.id,
      title: movie.title,
      posterPath: movie.posterUrl,
      backdropPath: movie.backdropUrl,
      overview: movie.overview,
      rating: movie.rating,
      releaseDate: movie.releaseDate
    });
    return response.data.data;
  },

  removeFromWishlist: async (movieId: number): Promise<{ success: boolean; movieId: number }> => {
    const response = await apiClient.delete(`/wishlist/${movieId}`);
    return response.data.data;
  },

  checkStatus: async (movieId: number): Promise<boolean> => {
    const response = await apiClient.get(`/wishlist/check/${movieId}`);
    return response.data.data.inWishlist;
  }
};
