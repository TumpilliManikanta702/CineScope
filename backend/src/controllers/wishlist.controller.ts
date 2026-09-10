import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { wishlistService } from '../services/wishlist.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const addWishlistSchema = z.object({
  movieId: z.number({ required_error: 'movieId is required' }).int().positive(),
  title: z.string({ required_error: 'title is required' }).min(1),
  posterPath: z.string().nullable().optional(),
  backdropPath: z.string().nullable().optional(),
  overview: z.string().optional(),
  rating: z.number().optional(),
  releaseDate: z.string().nullable().optional()
});

export class WishlistController {
  public async getWishlist(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const items = await wishlistService.getWishlist(userId);

      res.status(200).json({
        success: true,
        data: items,
        meta: {
          totalResults: items.length
        }
      });
    } catch (err) {
      next(err);
    }
  }

  public async addToWishlist(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const item = await wishlistService.addToWishlist(userId, req.body);

      res.status(201).json({
        success: true,
        message: 'Movie added to your wishlist',
        data: item
      });
    } catch (err) {
      next(err);
    }
  }

  public async removeFromWishlist(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const movieId = parseInt(req.params.movieId, 10);

      if (isNaN(movieId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid movie ID format'
        });
        return;
      }

      const result = await wishlistService.removeFromWishlist(userId, movieId);

      res.status(200).json({
        success: true,
        message: 'Movie removed from your wishlist',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  public async checkStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const movieId = parseInt(req.params.movieId, 10);

      if (isNaN(movieId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid movie ID format'
        });
        return;
      }

      const inWishlist = await wishlistService.isMovieInWishlist(userId, movieId);

      res.status(200).json({
        success: true,
        data: { inWishlist }
      });
    } catch (err) {
      next(err);
    }
  }
}

export const wishlistController = new WishlistController();
