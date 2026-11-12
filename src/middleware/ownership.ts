import type { NextFunction, Request, Response } from 'express';
import { ForbiddenError } from '../lib/errors.js';

export function requireOwnership(ownerIdField: string = 'userId') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return next(new ForbiddenError('Authentication required.'));
    }

    const ownerId = req.params[ownerIdField] ?? req.body?.[ownerIdField] ?? null;
    if (user.role === 'ADMIN' || user.role === 'MODERATOR') {
      return next();
    }

    if (ownerId && ownerId === user.id) {
      return next();
    }

    return next(new ForbiddenError('You can only access your own resource.'));
  };
}
