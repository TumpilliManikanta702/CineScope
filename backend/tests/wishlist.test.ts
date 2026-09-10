import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/server';

describe('Wishlist API Endpoints', () => {
  let token: string;
  let userId: string;

  const testMovie = {
    movieId: 693134,
    title: 'Dune: Part Two',
    posterPath: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/w1280/xOMo8BRK7PfcJv9JCnx7s520b4q.jpg',
    overview: 'Follow the mythic journey of Paul Atreides...',
    rating: 8.4,
    releaseDate: '2024-02-27'
  };

  beforeEach(async () => {
    const regRes = await request(app).post('/api/auth/register').send({
      name: 'Tester',
      email: `tester_${Date.now()}@example.com`,
      password: 'Password123!'
    });
    token = regRes.body.data.token;
    userId = regRes.body.data.user.id;
  });

  it('should reject unauthenticated requests to wishlist endpoints', async () => {
    const res = await request(app).get('/api/wishlist');
    expect(res.status).toBe(401);
  });

  it('should add a movie to the authenticated user wishlist', async () => {
    const res = await request(app)
      .post('/api/wishlist')
      .set('Authorization', `Bearer ${token}`)
      .send(testMovie);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.movieId).toBe(testMovie.movieId);
    expect(res.body.data.title).toBe(testMovie.title);
  });

  it('should prevent duplicate wishlist entries for the same user', async () => {
    // Add once
    await request(app)
      .post('/api/wishlist')
      .set('Authorization', `Bearer ${token}`)
      .send(testMovie);

    // Duplicate attempt
    const res = await request(app)
      .post('/api/wishlist')
      .set('Authorization', `Bearer ${token}`)
      .send(testMovie);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already in your wishlist/i);
  });

  it('should fetch all wishlist items for the authenticated user', async () => {
    await request(app)
      .post('/api/wishlist')
      .set('Authorization', `Bearer ${token}`)
      .send(testMovie);

    const res = await request(app)
      .get('/api/wishlist')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].movieId).toBe(testMovie.movieId);
  });

  it('should remove a movie from user wishlist', async () => {
    await request(app)
      .post('/api/wishlist')
      .set('Authorization', `Bearer ${token}`)
      .send(testMovie);

    const deleteRes = await request(app)
      .delete(`/api/wishlist/${testMovie.movieId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);

    // Verify it is no longer returned
    const listRes = await request(app)
      .get('/api/wishlist')
      .set('Authorization', `Bearer ${token}`);

    expect(listRes.body.data.length).toBe(0);
  });
});
