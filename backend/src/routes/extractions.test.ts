/**
 * Extraction endpoints tests
 */

import request from 'supertest';
import createApp from '../app.js';
import UserRepository from '../database/repositories/userRepository.js';
import bcryptjs from 'bcryptjs';

describe('Extraction Routes', () => {
  const app = createApp();
  let accessToken: string;

  beforeAll(async () => {
    // Create pre-verified user directly in DB
    const email = `extraction-test-${Date.now()}@example.com`;
    const password = 'Password123!';
    const passwordHash = await bcryptjs.hash(password, 10);
    
    await UserRepository.create({
      id: '88888888-8888-8888-8888-888888888888',
      email,
      passwordHash,
      name: 'Extraction Test User',
      tier: 'free',
      isVerified: true
    });

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password });

    accessToken = loginResponse.body.data.tokens.accessToken;
  });

  describe('POST /api/v1/extractions', () => {
    it('should upload a valid JavaScript file', async () => {
      const fileContent = `
        function greet(name) {
          return \`Hello, \${name}!\`;
        }
        const GREETING = 'Hi there';
      `;
      const response = await request(app)
        .post('/api/v1/extractions')
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('file', Buffer.from(fileContent), { filename: 'test.js' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.fileName).toBe('test.js');
      expect(response.body.data.status).toBe('processing');
      expect(response.body.data.fileSizeBytes).toBeGreaterThan(0);
    });

    it('should upload a valid TypeScript file', async () => {
      const fileContent = `interface User { id: string; }`;
      const response = await request(app)
        .post('/api/v1/extractions')
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('file', Buffer.from(fileContent), { filename: 'test.ts' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.fileName).toBe('test.ts');
    });

    it('should upload a React component', async () => {
      const fileContent = `function Counter() { return <div></div>; }`;
      const response = await request(app)
        .post('/api/v1/extractions')
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('file', Buffer.from(fileContent), { filename: 'Counter.jsx' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.fileName).toBe('Counter.jsx');
    });

    it('should reject invalid file type', async () => {
      const response = await request(app)
        .post('/api/v1/extractions')
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('file', Buffer.from('text content'), { filename: 'test.txt' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Invalid file type');
    });

    it('should reject Python file', async () => {
      const response = await request(app)
        .post('/api/v1/extractions')
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('file', Buffer.from('print("hello")'), { filename: 'test.py' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Invalid file type');
    });

    it('should reject empty file', async () => {
      const response = await request(app)
        .post('/api/v1/extractions')
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('file', Buffer.from(''), { filename: 'empty.js' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('empty');
    });

    it('should fail without file', async () => {
      const response = await request(app)
        .post('/api/v1/extractions')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('No file uploaded');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/extractions')
        .attach('file', Buffer.from('code'), { filename: 'test.js' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/extractions', () => {
    it('should list all extractions for user', async () => {
      await request(app)
        .post('/api/v1/extractions')
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('file', Buffer.from('function test() {}'), { filename: 'test1.js' });

      const response = await request(app)
        .get('/api/v1/extractions')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return empty list for new user', async () => {
      const email = `empty-user-${Date.now()}@example.com`;
      const password = 'Password123!';
      const passwordHash = await bcryptjs.hash(password, 10);
      
      await UserRepository.create({
        id: '99999999-9999-9999-9999-999999999999',
        email,
        passwordHash,
        name: 'Empty User',
        tier: 'free',
        isVerified: true
      });

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password });

      const newUserToken = loginResponse.body.data.tokens.accessToken;

      const response = await request(app)
        .get('/api/v1/extractions')
        .set('Authorization', `Bearer ${newUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/extractions')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/extractions/:id', () => {
    let extractionId: string;

    beforeAll(async () => {
      const uploadResponse = await request(app)
        .post('/api/v1/extractions')
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('file', Buffer.from('function test() {}'), { filename: 'test.js' });

      extractionId = uploadResponse.body.data.id;
    });

    it('should get extraction by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/extractions/${extractionId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(extractionId);
    });

    it('should fail with non-existent ID', async () => {
      const response = await request(app)
        .get('/api/v1/extractions/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get(`/api/v1/extractions/${extractionId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/extractions/:id', () => {
    let extractionId: string;

    beforeEach(async () => {
      const uploadResponse = await request(app)
        .post('/api/v1/extractions')
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('file', Buffer.from('function test() {}'), { filename: 'test.js' });

      extractionId = uploadResponse.body.data.id;
    });

    it('should delete extraction by ID', async () => {
      const response = await request(app)
        .delete(`/api/v1/extractions/${extractionId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      const getResponse = await request(app)
        .get(`/api/v1/extractions/${extractionId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(getResponse.body.success).toBe(false);
    });

    it('should fail with non-existent ID', async () => {
      const response = await request(app)
        .delete('/api/v1/extractions/non-existent-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .delete(`/api/v1/extractions/${extractionId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should prevent deleting another user\'s extraction', async () => {
      const email = `other-user-${Date.now()}@example.com`;
      const password = 'Password123!';
      const passwordHash = await bcryptjs.hash(password, 10);
      
      await UserRepository.create({
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        email,
        passwordHash,
        name: 'Other User',
        tier: 'free',
        isVerified: true
      });

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password });

      const otherUserToken = loginResponse.body.data.tokens.accessToken;

      const response = await request(app)
        .delete(`/api/v1/extractions/${extractionId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('do not own');
    });
  });

  describe('POST /api/v1/extractions/:id/export', () => {
    let extractionId: string;

    beforeAll(async () => {
      const uploadResponse = await request(app)
        .post('/api/v1/extractions')
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('file', Buffer.from('function test() {}'), { filename: 'test.js' });

      extractionId = uploadResponse.body.data.id;
    });

    it('should fail to export extraction without results', async () => {
      const response = await request(app)
        .post(`/api/v1/extractions/${extractionId}/export`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400); 

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('no results yet');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post(`/api/v1/extractions/${extractionId}/export`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    it('should allow 10 extractions per day for free tier', async () => {
      const email = `free-user-${Date.now()}-${Math.random()}@example.com`;
      const password = 'Password123!';
      const passwordHash = await bcryptjs.hash(password, 10);
      
      await UserRepository.create({
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        email,
        passwordHash,
        name: 'Free User',
        tier: 'free',
        isVerified: true
      });

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password });

      const freeUserToken = loginResponse.body.data.tokens.accessToken;

      for (let i = 0; i < 10; i++) {
        await request(app)
          .post('/api/v1/extractions')
          .set('Authorization', `Bearer ${freeUserToken}`)
          .attach('file', Buffer.from(`function test${i}() {}`), { filename: `test${i}.js` })
          .expect(201);
      }

      const response = await request(app)
        .post('/api/v1/extractions')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .attach('file', Buffer.from('function test11() {}'), { filename: 'test11.js' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Daily extraction limit');
    });
  });

  describe('File Type Validation', () => {
    let freshAccessToken: string;

    beforeAll(async () => {
      // Register a brand new user just for validation, bypassing the 10-upload rate limit
      const email = `validation-test-${Date.now()}@example.com`;
      const password = 'Password123!';
      const passwordHash = await bcryptjs.hash(password, 10);
      
      await UserRepository.create({
        id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        email,
        passwordHash,
        name: 'Validation Test User',
        tier: 'free',
        isVerified: true
      });

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password });

      freshAccessToken = loginResponse.body.data.tokens.accessToken;
    });

    it('should accept .js files', async () => {
      const response = await request(app)
        .post('/api/v1/extractions')
        .set('Authorization', `Bearer ${freshAccessToken}`)
        .attach('file', Buffer.from('const x = 1;'), { filename: 'test.js' })
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should accept .jsx files', async () => {
      const response = await request(app)
        .post('/api/v1/extractions')
        .set('Authorization', `Bearer ${freshAccessToken}`)
        .attach('file', Buffer.from('<div>test</div>'), { filename: 'test.jsx' })
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should accept .ts files', async () => {
      const response = await request(app)
        .post('/api/v1/extractions')
        .set('Authorization', `Bearer ${freshAccessToken}`)
        .attach('file', Buffer.from('const x: string = "test";'), { filename: 'test.ts' })
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should accept .tsx files', async () => {
      const response = await request(app)
        .post('/api/v1/extractions')
        .set('Authorization', `Bearer ${freshAccessToken}`)
        .attach('file', Buffer.from('function Test(): JSX.Element {}'), { filename: 'test.tsx' })
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should reject .json files', async () => {
      const response = await request(app)
        .post('/api/v1/extractions')
        .set('Authorization', `Bearer ${freshAccessToken}`)
        .attach('file', Buffer.from('{"test": "value"}'), { filename: 'test.json' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject .java files', async () => {
      const response = await request(app)
        .post('/api/v1/extractions')
        .set('Authorization', `Bearer ${freshAccessToken}`)
        .attach('file', Buffer.from('public class Test {}'), { filename: 'test.java' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});