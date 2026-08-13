/**
 * User repository for database operations
 */

import knex from '../../config/database.js';
import { User, UserWithPassword } from '../../types/auth.js';
import logger from '../../utils/logger.js';

export class UserRepository {
  /**
   * Create new user
   */
  static async create(user: Omit<UserWithPassword, 'createdAt' | 'updatedAt'>): Promise<User> {
    try {
      const result = await knex('users')
        .insert({
          id: user.id,
          email: user.email,
          password_hash: user.passwordHash,
          name: user.name,
          tier: user.tier,
        })
        .returning('*');

      const dbUser = result[0];

      return {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        tier: dbUser.tier,
        createdAt: dbUser.created_at.toISOString(),
        updatedAt: dbUser.updated_at.toISOString(),
      };
    } catch (error) {
      logger.error(`Failed to create user: ${error}`);
      throw error;
    }
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<UserWithPassword | null> {
    try {
      const user = await knex('users')
        .where('email', email)
        .first();

      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        passwordHash: user.password_hash,
        name: user.name,
        tier: user.tier,
        createdAt: user.created_at.toISOString(),
        updatedAt: user.updated_at.toISOString(),
      };
    } catch (error) {
      logger.error(`Failed to find user by email: ${error}`);
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<User | null> {
    try {
      const user = await knex('users').where('id', id).first();

      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        tier: user.tier,
        createdAt: user.created_at.toISOString(),
        updatedAt: user.updated_at.toISOString(),
      };
    } catch (error) {
      logger.error(`Failed to find user by ID: ${error}`);
      throw error;
    }
  }

  /**
   * Update user
   */
  static async update(
    id: string,
    updates: Partial<{ email: string; name: string; tier: string }>
  ): Promise<User> {
    try {
      const result = await knex('users')
        .where('id', id)
        .update(updates, ['*']);

      const user = result[0];

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        tier: user.tier,
        createdAt: user.created_at.toISOString(),
        updatedAt: user.updated_at.toISOString(),
      };
    } catch (error) {
      logger.error(`Failed to update user: ${error}`);
      throw error;
    }
  }

  /**
   * Update password
   */
  static async updatePassword(id: string, passwordHash: string): Promise<void> {
    try {
      await knex('users').where('id', id).update({ password_hash: passwordHash });
    } catch (error) {
      logger.error(`Failed to update password: ${error}`);
      throw error;
    }
  }

  /**
   * Delete user
   */
  static async delete(id: string): Promise<void> {
    try {
      await knex('users').where('id', id).del();
    } catch (error) {
      logger.error(`Failed to delete user: ${error}`);
      throw error;
    }
  }
}

export default UserRepository;