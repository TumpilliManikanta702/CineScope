import { Types } from 'mongoose';
import { Wishlist } from '../models/Wishlist';
import { WishlistItemResponse } from '../types';

export interface AddWishlistInput {
  movieId: number;
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  overview?: string;
  rating?: number;
  releaseDate?: string | null;
}

export class WishlistService {
  public async getWishlist(userId: string): Promise<WishlistItemResponse[]> {
    const items = await Wishlist.find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean();

    return items.map(this.sanitizeItem);
  }

  public async addToWishlist(userId: string, data: AddWishlistInput): Promise<WishlistItemResponse> {
    const userObjectId = new Types.ObjectId(userId);

    // Check if already in wishlist
    const existing = await Wishlist.findOne({ userId: userObjectId, movieId: data.movieId });
    if (existing) {
      const error: any = new Error('Movie is already in your wishlist');
      error.statusCode = 409;
      throw error;
    }

    try {
      const item = new Wishlist({
        userId: userObjectId,
        movieId: data.movieId,
        title: data.title,
        posterPath: data.posterPath || null,
        backdropPath: data.backdropPath || null,
        overview: data.overview || '',
        rating: typeof data.rating === 'number' ? data.rating : 0,
        releaseDate: data.releaseDate || null
      });

      await item.save();
      return this.sanitizeItem(item);
    } catch (err: any) {
      // Catch MongoDB duplicate key error code 11000 from compound index
      if (err.code === 11000) {
        const error: any = new Error('Movie is already in your wishlist');
        error.statusCode = 409;
        throw error;
      }
      throw err;
    }
  }

  public async removeFromWishlist(userId: string, movieId: number): Promise<{ success: boolean; movieId: number }> {
    const result = await Wishlist.findOneAndDelete({
      userId: new Types.ObjectId(userId),
      movieId
    });

    if (!result) {
      const error: any = new Error('Movie not found in your wishlist');
      error.statusCode = 404;
      throw error;
    }

    return { success: true, movieId };
  }

  public async isMovieInWishlist(userId: string, movieId: number): Promise<boolean> {
    const count = await Wishlist.countDocuments({
      userId: new Types.ObjectId(userId),
      movieId
    });
    return count > 0;
  }

  private sanitizeItem(item: any): WishlistItemResponse {
    return {
      id: item._id.toString(),
      movieId: item.movieId,
      title: item.title,
      posterUrl: item.posterPath,
      backdropUrl: item.backdropPath,
      overview: item.overview,
      rating: item.rating,
      releaseDate: item.releaseDate,
      createdAt: item.createdAt ? item.createdAt.toISOString() : new Date().toISOString()
    };
  }
}

export const wishlistService = new WishlistService();
