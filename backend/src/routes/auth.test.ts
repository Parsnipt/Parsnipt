/**
 * Authentication endpoints tests
 */

import request from 'supertest';
import createApp from '../app.js';
import UserRepository from '../database/repositories/userRepository.js';
import bcryptjs from 'bcryptjs';

describe('Authentication Routes', () => {
  const app = createApp();

  const testUser = {
    email: 'newuser@example.com',
    password: 'Password123!',
    name: 'New User',
  };

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.name).toBe(testUser.name);
      // Returns tokens upon registration, though they are limited until verified
      expect(response.body.data.tokens).toBeDefined(); 
    });

    it('should fail with missing fields', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_REQUEST');
    });

    it('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'not-an-email',
          password: 'Password123!',
          name: 'Test User',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_REQUEST');
    });

    it('should fail with weak password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'weak',
          name: 'Test User',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_REQUEST');
    });

    it('should fail if email already exists', async () => {
      // Register once
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'Password123!',
          name: 'First User'
        });

      // Try to register again with same email
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'Password123!',
          name: 'Second User'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_REQUEST');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    let testUserUnique: any;

    beforeAll(async () => {
      // Insert a PRE-VERIFIED user directly into the DB for login tests
      testUserUnique = {
        id: '66666666-6666-6666-6666-666666666666',
        email: `login-test-${Date.now()}@example.com`,
        password: 'Password123!',
        name: 'Login Test User',
      };
      
      const passwordHash = await bcryptjs.hash(testUserUnique.password, 10);
      await UserRepository.create({
        id: testUserUnique.id,
        email: testUserUnique.email,
        passwordHash,
        name: testUserUnique.name,
        tier: 'free',
        isVerified: true 
      });
    });

    it('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUserUnique.email,
          password: testUserUnique.password,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.tokens).toBeDefined();
      expect(response.body.data.tokens.accessToken).toBeDefined();
    });

    it('should fail with incorrect password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUserUnique.email,
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
    
    it('should fail to login if unverified', async () => {
      // Register normally (unverified by default)
      const unverifiedEmail = `unverified-${Date.now()}@example.com`;
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: unverifiedEmail,
          password: 'Password123!',
          name: 'Unverified User'
        });

      // Try to login immediately
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: unverifiedEmail,
          password: 'Password123!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('verify your account');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout with valid token', async () => {
      // Create verified user directly
      const logoutEmail = `logout-${Date.now()}@example.com`;
      const passwordHash = await bcryptjs.hash('Password123!', 10);
      await UserRepository.create({
        id: '77777777-7777-7777-7777-777777777777',
        email: logoutEmail,
        passwordHash,
        name: 'Logout User',
        tier: 'free',
        isVerified: true
      });

      // Login to get token
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: logoutEmail,
          password: 'Password123!',
        });

      const token = loginResponse.body.data.tokens.accessToken;

      // Logout
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Successfully logged out');
    });
  });
});