/**
 * Authentication business logic
 * Handles user registration, login, token generation
 */

import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
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
import logger from '../utils/logger.js';

// In-memory user store
const users = new Map<string, UserWithPassword>();

// Pre-populated test user for development (Auto-verified)
if (process.env.NODE_ENV !== 'production') {
  const testUser: UserWithPassword = {
    id: 'test-user-123',
    email: 'test@example.com',
    name: 'Test User',
    tier: 'free',
    passwordHash: bcryptjs.hashSync('password123', 10),
    isVerified: true, // Test user is pre-verified
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users.set(testUser.id, testUser);
  console.log('Running in Development Mode: Test user account injected.');
};

export class AuthService {
  private static validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format');
    }
  }

  private static validatePassword(password: string): void {
    if (password.length < 8) throw new ValidationError('Password must be at least 8 characters long');
    if (!/[A-Z]/.test(password)) throw new ValidationError('Password must contain at least one uppercase letter');
    if (!/[a-z]/.test(password)) throw new ValidationError('Password must contain at least one lowercase letter');
    if (!/[0-9]/.test(password)) throw new ValidationError('Password must contain at least one number');
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
    const user = Array.from(users.values()).find(u => u.verificationToken === token);
    
    if (!user) {
      throw new ValidationError('Invalid or expired verification token');
    }

    user.isVerified = true;
    user.verificationToken = undefined; // Clear the token
    user.updatedAt = new Date().toISOString();
    
    users.set(user.id, user);
    logger.info(`User email verified: ${user.email}`);
  }

  static async register(request: RegisterRequest): Promise<{ user: User; tokens: AuthTokens }> {
    const { email, password, name } = request;

    if (!email || !password || !name) throw new ValidationError('Email, password, and name are required');
    this.validateEmail(email);
    this.validatePassword(password);

    const existingUser = Array.from(users.values()).find((u) => u.email === email);
    if (existingUser) throw new ValidationError('User with this email already exists');

    const passwordHash = await this.hashPassword(password);
    const userId = randomUUID();
    const verificationToken = randomUUID(); // Generate secure token

    const newUser: UserWithPassword = {
      id: userId,
      email,
      name,
      tier: 'free',
      passwordHash,
      isVerified: false, // LOCK ACCOUNT
      verificationToken,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.set(userId, newUser);
    logger.info(`User registered: ${email}`);

    // MOCK EMAIL SENDER
    console.log('\n======================================================');
    console.log(`📩 MOCK EMAIL SENT TO: ${email}`);
    console.log(`Subject: Verify your Parsnipt Account`);
    console.log(`Body: Click here to verify your account:`);
    console.log(`http://localhost:3000/verify?token=${verificationToken}`);
    console.log('======================================================\n');
    // -------------------------

    const tokens = this.generateTokens(userId, email);
    const { passwordHash: _, ...userWithoutPassword } = newUser;

    return { user: userWithoutPassword, tokens };
  }

  static async login(request: LoginRequest): Promise<{ user: User; tokens: AuthTokens }> {
    const { email, password } = request;

    if (!email || !password) throw new ValidationError('Email and password are required');

    const user = Array.from(users.values()).find((u) => u.email === email);
    if (!user) throw new AuthenticationError('Invalid email or password');

    const isPasswordValid = await this.comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) throw new AuthenticationError('Invalid email or password');

    // ENFORCE EMAIL VERIFICATION
    if (!user.isVerified) {
      throw new AuthenticationError('Please check your email and verify your account before logging in.');
    }

    logger.info(`User logged in: ${email}`);
    const tokens = this.generateTokens(user.id, user.email);
    const { passwordHash: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, tokens };
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): { userId: string; email: string } {
    try {
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
      const decoded = jwt.verify(token, jwtSecret) as {
        userId: string;
        email: string;
        iat: number;
        exp: number;
      };
      return { userId: decoded.userId, email: decoded.email };
    } catch (error) {
      throw new AuthenticationError('Invalid or expired token');
    }
  }

  /**
   * Refresh access token
   */
  static refreshAccessToken(refreshToken: string): { accessToken: string; expiresIn: number } {
    try {
      const refreshSecret = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-change-in-production';
      const decoded = jwt.verify(refreshToken, refreshSecret) as {
        userId: string;
        email: string;
      };

      const newAccessToken = jwt.sign(
        { userId: decoded.userId, email: decoded.email },
        process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        { expiresIn: '24h' }
      );

      return {
        accessToken: newAccessToken,
        expiresIn: 86400,
      };
    } catch (error) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }
  }

  /**
   * Get user by ID
   */
  static getUser(userId: string): User {
    const user = users.get(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Update user profile
   */
  static updateUser(
    userId: string,
    updates: { name?: string; email?: string }
  ): User {
    const user = users.get(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    if (updates.email) {
      this.validateEmail(updates.email);
      const existingUser = Array.from(users.values()).find(
        (u) => u.email === updates.email && u.id !== userId
      );
      if (existingUser) {
        throw new ValidationError('Email already in use');
      }
      user.email = updates.email;
    }

    if (updates.name) {
      user.name = updates.name;
    }

    user.updatedAt = new Date().toISOString();
    users.set(userId, user);

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Change user password
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = users.get(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Verify current password
    const isPasswordValid = await this.comparePasswords(
      currentPassword,
      user.passwordHash
    );
    if (!isPasswordValid) {
      throw new AuthenticationError('Current password is incorrect');
    }

    // Validate new password
    this.validatePassword(newPassword);

    // Hash and update password
    user.passwordHash = await this.hashPassword(newPassword);
    user.updatedAt = new Date().toISOString();
    users.set(userId, user);

    logger.info(`Password changed for user: ${user.email}`);
  }
}

export default AuthService;