import { Request, Response, NextFunction } from 'express';
import { movieService } from '../services/movie.service';

export class MovieController {
  public async getTrending(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const timeWindow = req.query.timeWindow === 'day' ? 'day' : 'week';
      const page = parseInt(req.query.page as string, 10) || 1;

      const data = await movieService.getTrending(timeWindow, page);
      res.status(200).json({
        success: true,
        data: data.results,
        meta: {
          page: data.page,
          totalPages: data.totalPages,
          totalResults: data.totalResults
        }
      });
    } catch (err) {
      next(err);
    }
  }

  public async getPopular(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const data = await movieService.getPopular(page);

      res.status(200).json({
        success: true,
        data: data.results,
        meta: {
          page: data.page,
          totalPages: data.totalPages,
          totalResults: data.totalResults
        }
      });
    } catch (err) {
      next(err);
    }
  }

  public async getTopRated(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const data = await movieService.getTopRated(page);

      res.status(200).json({
        success: true,
        data: data.results,
        meta: {
          page: data.page,
          totalPages: data.totalPages,
          totalResults: data.totalResults
        }
      });
    } catch (err) {
      next(err);
    }
  }

  public async getNowPlaying(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const data = await movieService.getNowPlaying(page);

      res.status(200).json({
        success: true,
        data: data.results,
        meta: {
          page: data.page,
          totalPages: data.totalPages,
          totalResults: data.totalResults
        }
      });
    } catch (err) {
      next(err);
    }
  }

  public async getUpcoming(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const data = await movieService.getUpcoming(page);

      res.status(200).json({
        success: true,
        data: data.results,
        meta: {
          page: data.page,
          totalPages: data.totalPages,
          totalResults: data.totalResults
        }
      });
    } catch (err) {
      next(err);
    }
  }

  public async searchMovies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = (req.query.q as string) || '';
      const page = parseInt(req.query.page as string, 10) || 1;

      const filters = {
        genreId: req.query.genre ? parseInt(req.query.genre as string, 10) : undefined,
        year: req.query.year ? parseInt(req.query.year as string, 10) : undefined,
        minRating: req.query.rating ? parseFloat(req.query.rating as string) : undefined,
        language: req.query.language as string | undefined,
        sortBy: req.query.sort as string | undefined
      };

      const data = await movieService.searchMovies(query, page, filters);

      res.status(200).json({
        success: true,
        data: data.results,
        meta: {
          page: data.page,
          totalPages: data.totalPages,
          totalResults: data.totalResults
        }
      });
    } catch (err) {
      next(err);
    }
  }

  public async getMovieDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid movie ID parameter'
        });
        return;
      }

      const movie = await movieService.getMovieDetails(id);
      if (!movie) {
        res.status(404).json({
          success: false,
          message: 'Movie not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: movie
      });
    } catch (err) {
      next(err);
    }
  }

  public async getGenres(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const genres = await movieService.getGenres();
      res.status(200).json({
        success: true,
        data: genres
      });
    } catch (err) {
      next(err);
    }
  }
}

export const movieController = new MovieController();
