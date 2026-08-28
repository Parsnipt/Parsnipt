/**
 * User repository tests
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import knex from '../../config/database.js';
import UserRepository from './userRepository.js';
import bcryptjs from 'bcryptjs';

describe('UserRepository', () => {
  beforeAll(async () => {
    // Run migrations
    await knex.migrate.latest();
  });

  afterAll(async () => {
    // Rollback migrations
    await knex.migrate.rollback();
    await knex.destroy();
  });

  beforeEach(async () => {
    // Clear table before each test
    await knex('users').del();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const passwordHash = await bcryptjs.hash('Password123!', 10);
      const user = await UserRepository.create({
        id: '11111111-1111-1111-1111-111111111111',
        email: 'test@example.com',
        passwordHash,
        name: 'Test User',
        tier: 'free',
        isVerified: true,
      });

      expect(user.id).toBe('11111111-1111-1111-1111-111111111111');
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.tier).toBe('free');
      expect(user.isVerified).toBe(true);
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const passwordHash = await bcryptjs.hash('Password123!', 10);
      await UserRepository.create({
        id: '22222222-2222-2222-2222-222222222222',
        email: 'find@example.com',
        passwordHash,
        name: 'Find User',
        tier: 'pro',
        isVerified: true,
      });

      const user = await UserRepository.findByEmail('find@example.com');
      expect(user).not.toBeNull();
      expect(user?.email).toBe('find@example.com');
    });

    it('should return null for non-existent email', async () => {
      const user = await UserRepository.findByEmail('nonexistent@example.com');
      expect(user).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find user by ID', async () => {
      const passwordHash = await bcryptjs.hash('Password123!', 10);
      await UserRepository.create({
        id: '33333333-3333-3333-3333-333333333333',
        email: 'findid@example.com',
        passwordHash,
        name: 'Find by ID',
        tier: 'free',
        isVerified: false,
      });

      const user = await UserRepository.findById('33333333-3333-3333-3333-333333333333');
      expect(user).not.toBeNull();
      expect(user?.id).toBe('33333333-3333-3333-3333-333333333333');
      expect(user?.isVerified).toBe(false);
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      const passwordHash = await bcryptjs.hash('Password123!', 10);
      await UserRepository.create({
        id: '44444444-4444-4444-4444-444444444444',
        email: 'update@example.com',
        passwordHash,
        name: 'Update User',
        tier: 'free',
        isVerified: false,
      });

      const updated = await UserRepository.update('44444444-4444-4444-4444-444444444444', { name: 'Updated', isVerified: true });
      expect(updated.name).toBe('Updated');
      expect(updated.isVerified).toBe(true);
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      const passwordHash = await bcryptjs.hash('Password123!', 10);
      await UserRepository.create({
        id: '55555555-5555-5555-5555-555555555555',
        email: 'delete@example.com',
        passwordHash,
        name: 'Delete User',
        tier: 'free',
        isVerified: true,
      });

      await UserRepository.delete('55555555-5555-5555-5555-555555555555');
      const user = await UserRepository.findById('55555555-5555-5555-5555-555555555555');
      expect(user).toBeNull();
    });
  });
});