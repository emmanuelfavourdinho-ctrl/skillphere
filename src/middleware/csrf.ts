import csurf from 'csurf';
import type { NextFunction, Request, Response } from 'express';

export const csrfProtection = csurf({
  cookie: false,
  value: (req) => req.headers['x-csrf-token'] as string | undefined,
});

export function exposeCsrfToken(req: Request, res: Response, next: NextFunction) {
  res.locals.csrfToken = req.csrfToken();
  next();
}
