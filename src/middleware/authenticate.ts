import type { NextFunction, Request, Response } from 'express';
import prisma from '../database/prisma.js';
import { UnauthorizedError } from '../lib/errors.js';

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  const userId = req.session?.userId;
  if (!userId) {
    return next(new UnauthorizedError('Authentication required.'));
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      accountStatus: true,
      firstName: true,
      lastName: true,
    },
  });

  if (!user) {
    req.session.destroy(() => undefined);
    return next(new UnauthorizedError('Session invalid. Please sign in again.'));
  }

  if (user.accountStatus !== 'ACTIVE') {
    return next(new UnauthorizedError('Your account is not active.'));
  }

  req.user = user;
  next();
}
