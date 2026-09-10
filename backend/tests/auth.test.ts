import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/server';

describe('Auth API Endpoints', () => {
  const testUser = {
    name: 'Film Connoisseur',
    email: 'cinephile@example.com',
    password: 'Password123!'
  };

  it('should register a new user successfully and return JWT', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user).toHaveProperty('id');
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.data.user).not.toHaveProperty('passwordHash');
  });

  it('should prevent duplicate registration with the same email', async () => {
    // First registration
    await request(app).post('/api/auth/register').send(testUser);

    // Duplicate attempt
    const res = await request(app).post('/api/auth/register').send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it('should login an existing user with valid credentials', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
  });

  it('should reject login with an invalid password', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: 'WrongPassword999'
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should fetch user profile with valid JWT token', async () => {
    const regRes = await request(app).post('/api/auth/register').send(testUser);
    const token = regRes.body.data.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
  });

  it('should reject profile request without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
