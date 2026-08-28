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
          is_verified: user.isVerified || false,
          verification_token: user.verificationToken || null,
        })
        .returning('*');

      const dbUser = result[0];

      return {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        tier: dbUser.tier,
        isVerified: dbUser.is_verified,
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
        isVerified: user.is_verified,
        verificationToken: user.verification_token,
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
        isVerified: user.is_verified,
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
    updates: Partial<{ email: string; name: string; tier: string; isVerified: boolean }>
  ): Promise<User> {
    try {
      const dbUpdates: any = {};
      if (updates.email) dbUpdates.email = updates.email;
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.tier) dbUpdates.tier = updates.tier;
      if (updates.isVerified !== undefined) dbUpdates.is_verified = updates.isVerified;
      dbUpdates.updated_at = knex.fn.now();

      const result = await knex('users')
        .where('id', id)
        .update(dbUpdates, ['*']) as unknown as any[];

      const user = result[0];

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        tier: user.tier,
        isVerified: user.is_verified,
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
      await knex('users').where('id', id).update({ 
        password_hash: passwordHash,
        updated_at: knex.fn.now()
      });
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