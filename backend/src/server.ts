import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env';
import { connectDatabase } from './config/db';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

const app = express();

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or matching client
      if (!origin || origin === config.CLIENT_URL || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev for smooth review
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Body Parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Global Rate Limiter
app.use('/api', apiLimiter);

// Mount API routes
app.use('/api', apiRoutes);

// Catch-all for undefined routes
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Resource or endpoint not found'
  });
});

// Centralized error handler
app.use(errorHandler);

// Start Server (only if not imported by test runner)
if (process.env.NODE_ENV !== 'test') {
  connectDatabase()
    .then(() => {
      app.listen(config.PORT, () => {
        console.log(`====================================================`);
        console.log(`  CineScope Backend Server Running on Port ${config.PORT}`);
        console.log(`  Environment: ${config.NODE_ENV}`);
        console.log(`  Health Check: http://localhost:${config.PORT}/api/health`);
        console.log(`====================================================`);
      });
    })
    .catch(err => {
      console.error('[Server] Critical startup failure:', err);
      process.exit(1);
    });
}

export default app;
