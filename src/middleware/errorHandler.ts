import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../lib/errors.js';
import logger from '../lib/logger.js';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    logger.warn({ err, path: req.originalUrl, method: req.method }, 'Handled app error');
    return res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
    });
  }

  if (err instanceof Error) {
    logger.error({ err, path: req.originalUrl, method: req.method }, 'Unhandled error');
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'An unexpected internal error occurred.',
    });
  }

  logger.error({ err, path: req.originalUrl, method: req.method }, 'Unknown error');
  return res.status(500).json({
    error: 'InternalServerError',
    message: 'An unexpected internal error occurred.',
  });
}
