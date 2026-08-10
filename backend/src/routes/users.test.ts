/**
 * User endpoints tests
 */

import request from 'supertest';
import createApp from '../app.js';

describe('User Routes', () => {
  const app = createApp();
  let accessToken: string;

  beforeAll(async () => {
    // Register and login to get token
    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `user-test-${Date.now()}@example.com`,
        password: 'Password123!',
        name: 'Test User',
      });

    accessToken = registerResponse.body.data.tokens.accessToken;
  });

  describe('GET /api/v1/users/me', () => {
    it('should get current user profile', async () => {
      const response = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.email).toBeDefined();
      expect(response.body.data.name).toBeDefined();
      expect(response.body.data.passwordHash).toBeUndefined(); // Should not return password
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/users/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('PUT /api/v1/users/me', () => {
    it('should update user profile', async () => {
      const response = await request(app)
        .put('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Updated Name',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .put('/api/v1/users/me')
        .send({ name: 'New Name' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/users/me/password', () => {
    it('should change password with correct current password', async () => {
      const response = await request(app)
        .post('/api/v1/users/me/password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'Password123!',
          newPassword: 'NewPassword456!',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Password updated successfully');
    });

    it('should fail with incorrect current password', async () => {
      const response = await request(app)
        .post('/api/v1/users/me/password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'WrongPassword123!',
          newPassword: 'NewPassword456!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/users/me/password')
        .send({
          currentPassword: 'Password123!',
          newPassword: 'NewPassword456!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});