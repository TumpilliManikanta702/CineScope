import { Router } from 'express';
import { movieController } from '../controllers/movie.controller';

const router = Router();

// Discovery endpoints
router.get('/trending', movieController.getTrending);
router.get('/popular', movieController.getPopular);
router.get('/top-rated', movieController.getTopRated);
router.get('/now-playing', movieController.getNowPlaying);
router.get('/upcoming', movieController.getUpcoming);

// Search & Discover with filters
router.get('/search', movieController.searchMovies);

// Movie details
router.get('/:id', movieController.getMovieDetails);

export default router;
