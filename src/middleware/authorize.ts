import type { NextFunction, Request, Response } from 'express';
import { ForbiddenError } from '../lib/errors.js';

export function authorize(...roles: Array<'CUSTOMER' | 'ARTISAN' | 'ADMIN' | 'MODERATOR'>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole || !roles.includes(userRole)) {
      return next(new ForbiddenError('You are not authorized for this action.'));
    }

    next();
  };
}
