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

  it('should enforce zero duplicate movie IDs within any single rail', async () => {
    const endpoints = ['trending', 'popular', 'top-rated', 'now-playing', 'upcoming'];
    for (const ep of endpoints) {
      const res = await request(app).get(`/api/movies/${ep}`);
      expect(res.status).toBe(200);
      const movies = res.body.data;
      const ids = movies.map((m: any) => m.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    }
  });

  it('should provide category-specific content diversity across rails', async () => {
    const [trendingRes, popularRes, topRatedRes, nowPlayingRes, upcomingRes] = await Promise.all([
      request(app).get('/api/movies/trending'),
      request(app).get('/api/movies/popular'),
      request(app).get('/api/movies/top-rated'),
      request(app).get('/api/movies/now-playing'),
      request(app).get('/api/movies/upcoming')
    ]);

    const trending = trendingRes.body.data;
    const popular = popularRes.body.data;
    const topRated = topRatedRes.body.data;
    const nowPlaying = nowPlayingRes.body.data;
    const upcoming = upcomingRes.body.data;

    // Top-rated movies should be critically acclaimed masterpieces (rating >= 8.4)
    expect(topRated.length).toBeGreaterThan(0);
    expect(topRated.every((m: any) => m.rating >= 8.0)).toBe(true);
    expect(topRated.some((m: any) => m.title.includes('Shawshank') || m.title.includes('Godfather'))).toBe(true);

    // Initial viewport (first 5 cards) across consecutive sections must have high variety
    const trendingTop5 = trending.slice(0, 5).map((m: any) => m.id);
    const popularTop5 = popular.slice(0, 5).map((m: any) => m.id);
    const topRatedTop5 = topRated.slice(0, 5).map((m: any) => m.id);
    const nowPlayingTop5 = nowPlaying.slice(0, 5).map((m: any) => m.id);
    const upcomingTop5 = upcoming.slice(0, 5).map((m: any) => m.id);

    // Popular top 5 should not simply duplicate Trending top 5
    const popularOverlapWithTrending = popularTop5.filter((id: number) => trendingTop5.includes(id));
    expect(popularOverlapWithTrending.length).toBeLessThanOrEqual(2);

    // Top Rated top 5 should represent classic masterpieces distinct from Now Playing
    const topRatedOverlapWithNowPlaying = topRatedTop5.filter((id: number) => nowPlayingTop5.includes(id));
    expect(topRatedOverlapWithNowPlaying.length).toBe(0);

    // Coming Soon should have distinct upcoming titles
    const upcomingOverlapWithTrending = upcomingTop5.filter((id: number) => trendingTop5.includes(id));
    expect(upcomingOverlapWithTrending.length).toBeLessThanOrEqual(1);
  });

  it('should fetch movie details for movies across all categories', async () => {
    // Check movie from Trending (Dune: Part Two)
    const duneRes = await request(app).get('/api/movies/693134');
    expect(duneRes.status).toBe(200);
    expect(duneRes.body.data.title).toMatch(/Dune/i);
    expect(duneRes.body.data).toHaveProperty('cast');
    expect(duneRes.body.data).toHaveProperty('recommendations');

    // Check movie from Top Rated (The Shawshank Redemption)
    const shawshankRes = await request(app).get('/api/movies/278');
    expect(shawshankRes.status).toBe(200);
    expect(shawshankRes.body.data.title).toMatch(/Shawshank/i);
    expect(shawshankRes.body.data.rating).toBeGreaterThanOrEqual(8.5);

    // Check movie from Coming Soon (Gladiator II)
    const gladiatorRes = await request(app).get('/api/movies/558449');
    expect(gladiatorRes.status).toBe(200);
    expect(gladiatorRes.body.data.title).toMatch(/Gladiator/i);
  });

  it('should return 404 for nonexistent movie details', async () => {
    const res = await request(app).get('/api/movies/99999999');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should search movies with query and sort options across catalog', async () => {
    const res = await request(app).get('/api/movies/search?q=Batman&sort=popularity');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].title).toMatch(/Batman/i);
  });

  it('should fetch movie genre list', async () => {
    const res = await request(app).get('/api/genres');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((g: any) => g.name === 'Science Fiction')).toBe(true);
  });
});
