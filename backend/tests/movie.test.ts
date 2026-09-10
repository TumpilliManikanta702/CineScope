import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/server';

describe('Movie Discovery & Search Endpoints', () => {
  it('should fetch trending movies with pagination metadata', async () => {
    const res = await request(app).get('/api/movies/trending?page=1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.meta).toHaveProperty('page', 1);
    expect(res.body.meta).toHaveProperty('totalPages');
    expect(res.body.meta).toHaveProperty('totalResults');

    const firstMovie = res.body.data[0];
    expect(firstMovie).toHaveProperty('id');
    expect(firstMovie).toHaveProperty('title');
    expect(firstMovie).toHaveProperty('rating');
  });

  it('should fetch popular, top-rated, now-playing, and upcoming rails', async () => {
    const endpoints = ['popular', 'top-rated', 'now-playing', 'upcoming'];
    for (const ep of endpoints) {
      const res = await request(app).get(`/api/movies/${ep}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    }
  });

  it('should fetch movie details with credits and recommendations', async () => {
    const res = await request(app).get('/api/movies/693134');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(693134);
    expect(res.body.data.title).toMatch(/Dune/i);
    expect(res.body.data).toHaveProperty('cast');
    expect(res.body.data).toHaveProperty('recommendations');
    expect(Array.isArray(res.body.data.genres)).toBe(true);
  });

  it('should return 404 for nonexistent movie details', async () => {
    const res = await request(app).get('/api/movies/99999999');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should search movies with query and sort options', async () => {
    const res = await request(app).get('/api/movies/search?q=Dune&sort=rating');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].title).toMatch(/Dune/i);
  });

  it('should fetch movie genre list', async () => {
    const res = await request(app).get('/api/genres');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((g: any) => g.name === 'Science Fiction')).toBe(true);
  });
});
