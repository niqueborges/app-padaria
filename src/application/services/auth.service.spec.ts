import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthService } from './auth.service.js';
import type { UserRepositoryPort } from '../ports/user.repository.port.js';
import { User } from '../../domain/entities/user.entity.js';
import { UnauthorizedError } from '../../domain/errors/app-error.js';

describe('AuthService (Application)', () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<UserRepositoryPort>;

  const hashedPassword = bcrypt.hashSync('padaria123', 10);
  const mockUser = new User({
    id: 'user-1',
    name: 'Pedro',
    email: 'pedro@padaria.com',
    password: hashedPassword,
  });

  beforeEach(() => {
    mockUserRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      count: jest.fn(),
    };

    authService = new AuthService(mockUserRepository);
  });

  describe('login', () => {
    it('should authenticate user and return access token when credentials are valid', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await authService.login({
        email: 'pedro@padaria.com',
        password: 'padaria123',
      });

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('pedro@padaria.com');
      expect(result).toHaveProperty('accessToken');
      expect(result.user).toEqual({
        id: 'user-1',
        name: 'Pedro',
        email: 'pedro@padaria.com',
      });
    });

    it('should throw UnauthorizedError when user is not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'naoexiste@padaria.com',
          password: 'qualquer-senha',
        })
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError when password does not match', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(
        authService.login({
          email: 'pedro@padaria.com',
          password: 'senha-errada',
        })
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('validateToken', () => {
    it('should decode and return token payload when token is valid', () => {
      const token = jwt.sign(
        { sub: 'user-1', name: 'Pedro', email: 'pedro@padaria.com' },
        process.env['JWT_SECRET'] ?? 'dev-secret-change-in-prod'
      );

      const payload = authService.validateToken(token);

      expect(payload.sub).toBe('user-1');
      expect(payload.name).toBe('Pedro');
      expect(payload.email).toBe('pedro@padaria.com');
    });

    it('should throw UnauthorizedError when token is invalid', () => {
      expect(() => authService.validateToken('token-invalido')).toThrow(UnauthorizedError);
    });
  });
});
