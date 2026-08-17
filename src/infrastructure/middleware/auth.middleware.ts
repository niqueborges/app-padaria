import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../database/prisma.client.js';
import { PrismaUserRepository } from '../database/repositories/prisma-user.repository.js';
import { AuthService } from '../../application/services/auth.service.js';
import type { JwtPayload } from '../../application/dto/auth.dto.js';
import { UnauthorizedError } from '../../domain/errors/app-error.js';

// Extensao de tipagem do Express Request para incluir user autenticado
declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtPayload;
  }
}

const userRepository = new PrismaUserRepository(prisma);
const authService = new AuthService(userRepository);

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new UnauthorizedError('Token de autenticação não fornecido.');
  }

  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw new UnauthorizedError('Formato de token inválido. Use "Bearer <token>".');
  }

  const user = authService.validateToken(token);
  req.user = user;
  next();
}
