/**
 * Authentication business logic
 * Handles user registration, login, token generation
 */

import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {randomUUID} from 'crypto';
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

// In-memory user store (replaced with database in Issue #5)
// This is temporary for testing purposes
const users = new Map<string, UserWithPassword>();

// Pre-populated test user for development
if (process.env.NODE_ENV !== 'production') {
  const testUser: UserWithPassword = {
    id: 'test-user-123',
    email: 'test@example.com',
    name: 'Test User',
    tier: 'free',
    passwordHash: bcryptjs.hashSync('password123', 10),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

users.set(testUser.id, testUser);

console.log('Running in Development Mode: Test user account injected.');
};

export class AuthService {
  /**
   * Validate email format
   */
  private static validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format');
    }
  }

  /**
   * Validate password strength
   */
  private static validatePassword(password: string): void {
    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      throw new ValidationError('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      throw new ValidationError('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      throw new ValidationError('Password must contain at least one number');
    }
  }

  /**
   * Hash password with bcrypt
   */
  private static async hashPassword(password: string): Promise<string> {
    const salt = await bcryptjs.genSalt(10);
    return bcryptjs.hash(password, salt);
  }

  /**
   * Compare plaintext password with hash
   */
  private static async comparePasswords(
    plaintext: string,
    hash: string
  ): Promise<boolean> {
    return bcryptjs.compare(plaintext, hash);
  }

  /**
   * Generate JWT tokens
   */
  private static generateTokens(userId: string, email: string): AuthTokens {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
    console.error('🔥 FATAL ERROR: JWT_SECRET environment variable is not set.');
    process.exit(1); // Kills the server immediately
    }

    const refreshSecret = process.env.REFRESH_TOKEN_SECRET;
    if (!refreshSecret) {
    console.error('🔥 FATAL ERROR: REFRESH_TOKEN_SECRET environment variable is not set.');
    process.exit(1); // Kills the server immediately
    }
    const expiresIn = 86400; // 24 hours in seconds

    const accessToken = jwt.sign(
      { userId, email },
      jwtSecret,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { userId, email },
      refreshSecret,
      { expiresIn: '7d' }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  /**
   * Register new user
   */
  static async register(request: RegisterRequest): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      const { email, password, name } = request;

      // Validation
      if (!email || !password || !name) {
        throw new ValidationError('Email, password, and name are required');
      }

      this.validateEmail(email);
      this.validatePassword(password);

      // Check if user already exists
      const existingUser = Array.from(users.values()).find(
        (u) => u.email === email
      );
      if (existingUser) {
        throw new ValidationError('User with this email already exists');
      }

      // Hash password
      const passwordHash = await this.hashPassword(password);

      // Create user
      const userId = randomUUID();
      const newUser: UserWithPassword = {
        id: userId,
        email,
        name,
        tier: 'free',
        passwordHash,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      users.set(userId, newUser);

      logger.info(`User registered: ${email}`);

      // Generate tokens
      const tokens = this.generateTokens(userId, email);

      // Return user without password
      const { passwordHash: _, ...userWithoutPassword } = newUser;

      return {
        user: userWithoutPassword,
        tokens,
      };
    } catch (error) {
      logger.error(`Registration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Login user
   */
  static async login(request: LoginRequest): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      const { email, password } = request;

      // Validation
      if (!email || !password) {
        throw new ValidationError('Email and password are required');
      }

      // Find user by email
      const user = Array.from(users.values()).find((u) => u.email === email);
      if (!user) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Compare passwords
      const isPasswordValid = await this.comparePasswords(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new AuthenticationError('Invalid email or password');
      }

      logger.info(`User logged in: ${email}`);

      // Generate tokens
      const tokens = this.generateTokens(user.id, user.email);

      // Return user without password
      const { passwordHash: _, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        tokens,
      };
    } catch (error) {
      logger.error(`Login error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
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