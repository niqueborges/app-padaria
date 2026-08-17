import type { Request, Response } from 'express';
import type { AuthService } from '../../../application/services/auth.service.js';
import { loginSchema } from '../../../application/dto/auth.dto.js';
import { ValidationError, UnauthorizedError } from '../../../domain/errors/app-error.js';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login = async (req: Request, res: Response): Promise<void> => {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      throw new ValidationError(issue?.message ?? 'Credenciais inválidas.');
    }

    const result = await this.authService.login(parseResult.data);
    res.status(200).json(result);
  };

  me = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError('Usuário não autenticado.');
    }

    res.status(200).json(req.user);
  };
}
