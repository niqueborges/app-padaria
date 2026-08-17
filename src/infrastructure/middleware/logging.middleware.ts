import { randomUUID } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { logger } from '../../shared/logger.js';

export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId = req.headers['x-request-id']?.toString() ?? randomUUID();
  const startTime = Date.now();

  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-Id', requestId);

  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    const { method, originalUrl } = req;
    const { statusCode } = res;

    logger.info({
      requestId,
      method,
      url: originalUrl,
      statusCode,
      durationMs,
    });
  });

  next();
}
