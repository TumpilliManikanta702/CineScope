import dotenv from 'dotenv';
import path from 'path';

// Load .env file from backend root or workspace root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || 'cinescope_secure_jwt_secret_dev_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  TMDB_API_KEY: (process.env.TMDB_API_KEY ? process.env.TMDB_API_KEY.trim() : '') || '140afbbf983f965b912a299dfe0a6cc1',
  TMDB_BASE_URL: 'https://api.themoviedb.org/3',
  TMDB_IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
  CACHE_TTL: parseInt(process.env.CACHE_TTL || '600', 10), // 10 minutes default
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  isProduction: process.env.NODE_ENV === 'production'
};
