import 'express-async-errors';
import path from 'node:path';
import fs from 'node:fs';
import express from 'express';
import type { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import rateLimit from 'express-rate-limit';
import { logger } from './shared/logger.js';
import { requestLoggerMiddleware } from './infrastructure/middleware/logging.middleware.js';
import { errorHandlerMiddleware } from './infrastructure/middleware/error-handler.middleware.js';
import { authRoutes } from './infrastructure/http/routes/auth.routes.js';
import { productRoutes } from './infrastructure/http/routes/product.routes.js';
import { saleRoutes } from './infrastructure/http/routes/sale.routes.js';
import { reportRoutes } from './infrastructure/http/routes/report.routes.js';

const app = express();
app.use(express.json());

// Observabilidade e Logging HTTP
app.use(requestLoggerMiddleware);

// Seguranca HTTP
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env['CORS_ORIGIN']?.split(',') ?? '*' }));

// Limitador de Taxa de Requisicoes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Muitas requisicoes originadas deste IP, tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Configuracao da Documentacao Swagger
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Padaria do Pedro',
      version: '1.0.0',
      description: 'Sistema de gestao de produtos, vendas e relatorios financeiros.',
    },
    servers: [
      {
        url: `http://localhost:${process.env['PORT'] ?? 3000}`,
        description: 'Servidor Local',
      },
    ],
  },
  apis: ['./src/infrastructure/http/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health Check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/reports', reportRoutes);

// Servir Frontend em Producao (SPA Fallback)
const frontendDistPath = path.resolve(process.cwd(), 'frontend', 'dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req: Request, res: Response, next) => {
    if (
      req.path.startsWith('/api') ||
      req.path.startsWith('/api-docs') ||
      req.path.startsWith('/health')
    ) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Middleware Global de Erros
app.use(errorHandlerMiddleware);

const PORT = Number(process.env['PORT']) || 3000;
app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT}`);
  logger.info(`Documentacao Swagger disponivel em http://localhost:${PORT}/api-docs`);
});
