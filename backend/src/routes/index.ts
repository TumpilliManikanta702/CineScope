import { Router } from 'express';
import authRoutes from './auth.routes';
import movieRoutes from './movie.routes';
import wishlistRoutes from './wishlist.routes';
import { movieController } from '../controllers/movie.controller';
import { cacheService } from '../services/cache.service';
import mongoose from 'mongoose';

const router = Router();

// Health & System Status Endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    cache: cacheService.getStats()
  });
});

// Genre list route
router.get('/genres', movieController.getGenres);

// Modular feature routes
router.use('/auth', authRoutes);
router.use('/movies', movieRoutes);
router.use('/wishlist', wishlistRoutes);

export default router;
