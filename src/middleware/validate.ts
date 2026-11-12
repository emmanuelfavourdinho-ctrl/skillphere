import type { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../lib/errors.js';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issues = result.error.issues.map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`).join(', ');
      return next(new ValidationError(issues));
    }

    req.body = result.data;
    next();
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const issues = result.error.issues.map((issue) => `${issue.path.join('.') || 'query'}: ${issue.message}`).join(', ');
      return next(new ValidationError(issues));
    }

    req.query = result.data as Record<string, unknown>;
    next();
  };
}
