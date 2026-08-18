import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import type { UserRepositoryPort } from '../ports/user.repository.port.js';
import type { LoginInput, AuthResponseDTO, JwtPayload } from '../dto/auth.dto.js';
import { UnauthorizedError } from '../../domain/errors/app-error.js';

export class AuthService {
  private readonly jwtSecret: string;
  private readonly expiresIn: StringValue;

  constructor(private readonly userRepository: UserRepositoryPort) {
    const secret = process.env['JWT_SECRET'];
    if (!secret) {
      throw new Error(
        'JWT_SECRET nao definido. Configure a variavel de ambiente antes de iniciar a aplicacao.'
      );
    }
    this.jwtSecret = secret;
    this.expiresIn = (process.env['JWT_EXPIRES_IN'] ?? '8h') as StringValue;
  }

  async login(input: LoginInput): Promise<AuthResponseDTO> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError('E-mail ou senha incorretos.');
    }

    const passwordMatches = await bcrypt.compare(input.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedError('E-mail ou senha incorretos.');
    }

    const payload: JwtPayload = {
      sub: user.id ?? '',
      name: user.name,
      email: user.email,
    };

    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.expiresIn,
    });

    return {
      accessToken,
      user: {
        id: user.id ?? '',
        name: user.name,
        email: user.email,
      },
    };
  }

  validateToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as JwtPayload;
      return decoded;
    } catch {
      throw new UnauthorizedError('Token de acesso inválido ou expirado.');
    }
  }
}
