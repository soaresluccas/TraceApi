import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../infrastructure/services/AuthService';

export interface AuthRequest extends Request {
  userId?: string;
  email?: string;
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: 'Token não fornecido',
      });
      return;
    }

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      res.status(401).json({
        success: false,
        message: 'Formato de token inválido',
      });
      return;
    }

    const authService = new AuthService();
    const payload = authService.verifyToken(token);

    if (!payload) {
      res.status(401).json({
        success: false,
        message: 'Token inválido ou expirado',
      });
      return;
    }

    req.userId = payload.userId;
    req.email = payload.email;

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao validar token',
    });
  }
}
