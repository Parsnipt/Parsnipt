/**
 * Authentication business logic
 * Handles user registration, login, token generation
 */

import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import knex from '../config/database.js';
import {
  RegisterRequest,
  LoginRequest,
  AuthTokens,
  User,
  UserWithPassword,
} from '../types/auth.js';
import {
  ValidationError,
  AuthenticationError,
  NotFoundError,
} from '../utils/errors.js';
import EmailService from './emailService.js';
import logger from '../utils/logger.js';

// Helper to map DB row to TypeScript object safely
const mapDbToUser = (dbUser: any): UserWithPassword => ({
  id: dbUser.id,
  email: dbUser.email,
  name: dbUser.name,
  tier: dbUser.tier,
  passwordHash: dbUser.password_hash || dbUser.passwordHash,
  isVerified: dbUser.is_verified === undefined ? dbUser.isVerified : dbUser.is_verified,
  verificationToken: dbUser.verification_token || dbUser.verificationToken,
  createdAt: dbUser.created_at || dbUser.createdAt,
  updatedAt: dbUser.updated_at || dbUser.updatedAt
});

export class AuthService {
  private static validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format');
    }
  }

 private static validatePassword(password: string): void {
    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }
    
    // Check for at least one uppercase letter without regex
    if (password === password.toLowerCase()) {
      throw new ValidationError('Password must contain at least one uppercase letter');
    }
    
    // Check for at least one lowercase letter without regex
    if (password === password.toUpperCase()) {
      throw new ValidationError('Password must contain at least one lowercase letter');
    }
    
    // Check for at least one number
    if (!/\d/.test(password)) {
      throw new ValidationError('Password must contain at least one number');
    }
  }

  private static async hashPassword(password: string): Promise<string> {
    const salt = await bcryptjs.genSalt(10);
    return bcryptjs.hash(password, salt);
  }

  private static async comparePasswords(plaintext: string, hash: string): Promise<boolean> {
    return bcryptjs.compare(plaintext, hash);
  }

  private static generateTokens(userId: string, email: string): AuthTokens {
    const jwtSecret = process.env.JWT_SECRET || 'dev-secret-key';
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET || 'dev-refresh-key';
    const expiresIn = 86400;

    const accessToken = jwt.sign({ userId, email }, jwtSecret, { expiresIn: '24h' });
    const refreshToken = jwt.sign({ userId, email }, refreshSecret, { expiresIn: '7d' });

    return { accessToken, refreshToken, expiresIn };
  }

  /**
   * Verify Email Token
   */
  static async verifyEmail(token: string): Promise<void> {
    const dbUser = await knex('users')
      .where('verification_token', token)
      .first();
    
    if (!dbUser) {
      throw new ValidationError('Invalid or expired verification token');
    }

    await knex('users').where({ id: dbUser.id }).update({
      is_verified: true,
      verification_token: null,
      updated_at: new Date().toISOString()
    });
    
    logger.info(`User email verified: ${dbUser.email}`);
  }

  static async register(request: RegisterRequest): Promise<{ user: User; tokens: AuthTokens }> {
    const { email, password, name } = request;

    if (!email || !password || !name) throw new ValidationError('Email, password, and name are required');
    this.validateEmail(email);
    this.validatePassword(password);

    const existingUser = await knex('users').where({ email }).first();
    if (existingUser) throw new ValidationError('User with this email already exists');

    const passwordHash = await this.hashPassword(password);
    const userId = randomUUID();
    const verificationToken = randomUUID();
    const now = new Date().toISOString();

    const newUser = {
      id: userId,
      email,
      name,
      tier: 'free',
      password_hash: passwordHash,
      is_verified: false,
      verification_token: verificationToken,
      created_at: now,
      updated_at: now,
    };

    // Insert into DB trying snake_case first, fallback to camelCase
    try {
      await knex('users').insert(newUser);
    } catch (e) {
      await knex('users').insert({
        id: userId, email, name, tier: 'free', passwordHash, isVerified: false, verificationToken, createdAt: now, updatedAt: now
      });
    }

    logger.info(`User registered: ${email}`);

    // Send verification email
    await EmailService.sendVerificationEmail(email, verificationToken);

    const tokens = this.generateTokens(userId, email);
    
    return { 
      user: { id: userId, email, name, tier: 'free', isVerified: false, createdAt: now, updatedAt: now }, 
      tokens 
    };
  }

  static async login(request: LoginRequest): Promise<{ user: User; tokens: AuthTokens }> {
    const { email, password } = request;
    if (!email || !password) throw new ValidationError('Email and password are required');

    const dbUser = await knex('users').where({ email }).first();
    if (!dbUser) throw new AuthenticationError('Invalid email or password');

    const user = mapDbToUser(dbUser);
    const isPasswordValid = await this.comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) throw new AuthenticationError('Invalid email or password');

    if (!user.isVerified) {
      throw new AuthenticationError('Please check your email and verify your account before logging in.');
    }

    logger.info(`User logged in: ${email}`);
    const tokens = this.generateTokens(user.id, user.email);
    const { passwordHash: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, tokens };
  }

  static verifyToken(token: string): { userId: string; email: string } {
    try {
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
      const decoded = jwt.verify(token, jwtSecret) as { userId: string; email: string };
      return { userId: decoded.userId, email: decoded.email };
    } catch (error) {
      throw new AuthenticationError('Invalid or expired token');
    }
  }

  static refreshAccessToken(refreshToken: string): { accessToken: string; expiresIn: number } {
    try {
      const refreshSecret = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-change-in-production';
      const decoded = jwt.verify(refreshToken, refreshSecret) as { userId: string; email: string };

      const newAccessToken = jwt.sign(
        { userId: decoded.userId, email: decoded.email },
        process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        { expiresIn: '24h' }
      );

      return { accessToken: newAccessToken, expiresIn: 86400 };
    } catch (error) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }
  }

  static async getUser(userId: string): Promise<User> {
    const dbUser = await knex('users').where({ id: userId }).first();
    if (!dbUser) throw new NotFoundError('User');

    const user = mapDbToUser(dbUser);
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async updateUser(userId: string, updates: { name?: string; email?: string }): Promise<User> {
    const dbUser = await knex('users').where({ id: userId }).first();
    if (!dbUser) throw new NotFoundError('User');

    if (updates.email) {
      this.validateEmail(updates.email);
      const existingUser = await knex('users').where({ email: updates.email }).whereNot({ id: userId }).first();
      if (existingUser) throw new ValidationError('Email already in use');
    }

    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.email) updateData.email = updates.email;
    updateData.updated_at = new Date().toISOString();

    try {
      await knex('users').where({ id: userId }).update(updateData);
    } catch (e) {
      // Fallback for camelCase schema
      updateData.updatedAt = updateData.updated_at;
      delete updateData.updated_at;
      await knex('users').where({ id: userId }).update(updateData);
    }

    return this.getUser(userId);
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const dbUser = await knex('users').where({ id: userId }).first();
    if (!dbUser) throw new NotFoundError('User');

    const user = mapDbToUser(dbUser);
    const isPasswordValid = await this.comparePasswords(currentPassword, user.passwordHash);
    if (!isPasswordValid) throw new AuthenticationError('Current password is incorrect');

    this.validatePassword(newPassword);
    const passwordHash = await this.hashPassword(newPassword);

    try {
      await knex('users').where({ id: userId }).update({ 
        password_hash: passwordHash, 
        updated_at: new Date().toISOString() 
      });
    } catch (e) {
      await knex('users').where({ id: userId }).update({ 
        passwordHash, 
        updatedAt: new Date().toISOString() 
      });
    }

    logger.info(`Password changed for user: ${user.email}`);
  }
}

export default AuthService;