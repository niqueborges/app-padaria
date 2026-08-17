import { Router } from 'express';
import { prisma } from '../../database/prisma.client.js';
import { PrismaUserRepository } from '../../database/repositories/prisma-user.repository.js';
import { AuthService } from '../../../application/services/auth.service.js';
import { AuthController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const userRepository = new PrismaUserRepository(prisma);
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

const router = Router();

/**
 * @openapi
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: pedro@padaria.com
 *         password:
 *           type: string
 *           example: padaria123
 *     AuthResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             name:
 *               type: string
 *               example: Pedro
 *             email:
 *               type: string
 *               example: pedro@padaria.com
 */

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Autenticar operador da padaria
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Autenticação realizada com sucesso e token JWT emitido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: E-mail ou senha incorretos
 *       422:
 *         description: Formato de entrada inválido
 */
router.post('/login', authController.login);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Obter dados do operador autenticado
 *     tags:
 *       - Autenticação
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do operador autenticado
 *       401:
 *         description: Token não fornecido ou inválido
 */
router.get('/me', authMiddleware, authController.me);

export { router as authRoutes };
