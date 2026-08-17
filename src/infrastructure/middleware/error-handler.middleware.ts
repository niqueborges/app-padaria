import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../domain/errors/app-error.js';
import { logger } from '../../shared/logger.js';

export function errorHandlerMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = req.headers['x-request-id']?.toString();

  if (err instanceof AppError) {
    logger.warn({
      requestId,
      type: 'DomainAppError',
      name: err.name,
      statusCode: err.statusCode,
      message: err.message,
    });

    res.status(err.statusCode).json({
      error: err.message,
      statusCode: err.statusCode,
      requestId,
    });
    return;
  }

  const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
  const stack = err instanceof Error ? err.stack : undefined;

  logger.error({
    requestId,
    type: 'UnhandledError',
    message: errorMessage,
    stack,
  });

  res.status(500).json({
    error: process.env['NODE_ENV'] === 'production' ? 'Erro interno no servidor' : errorMessage,
    statusCode: 500,
    requestId,
  });
}
