import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { config } from '../config/env';
import { UserResponse, AuthTokens } from '../types';

export class AuthService {
  public async register(name: string, email: string, password: string): Promise<AuthTokens> {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      const error: any = new Error('An account with this email address already exists');
      error.statusCode = 409;
      throw error;
    }

    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: password // Pre-save hook hashes this
    });

    await user.save();

    const userResponse = this.sanitizeUser(user);
    const token = this.generateToken(user._id.toString());

    return { token, user: userResponse };
  }

  public async login(email: string, password: string): Promise<AuthTokens> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

    if (!user) {
      const error: any = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error: any = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const userResponse = this.sanitizeUser(user);
    const token = this.generateToken(user._id.toString());

    return { token, user: userResponse };
  }

  public async getCurrentUser(userId: string): Promise<UserResponse> {
    const user = await User.findById(userId);
    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return this.sanitizeUser(user);
  }

  private generateToken(userId: string): string {
    return jwt.sign({ sub: userId }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN as any
    });
  }

  private sanitizeUser(user: any): UserResponse {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString()
    };
  }
}

export const authService = new AuthService();
