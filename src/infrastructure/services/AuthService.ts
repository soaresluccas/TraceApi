import jwt, { type Secret } from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export class AuthService {
  private readonly jwtSecret: Secret;
  private readonly jwtExpiration: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    this.jwtExpiration = process.env.JWT_EXPIRATION || '24h';
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiration,
    } as jwt.SignOptions);
  }

  verifyToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as TokenPayload;
      return decoded;
    } catch {
      return null;
    }
  }

  generateTokens(payload: TokenPayload): AuthTokens {
    const accessToken = this.generateToken(payload);
    return { accessToken };
  }
}
