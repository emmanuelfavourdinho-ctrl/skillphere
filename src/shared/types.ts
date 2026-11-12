import 'express-session';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: 'CUSTOMER' | 'ARTISAN' | 'ADMIN' | 'MODERATOR';
        accountStatus?: string;
        firstName?: string;
        lastName?: string;
      };
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    role?: 'CUSTOMER' | 'ARTISAN' | 'ADMIN' | 'MODERATOR';
    csrfSecret?: string;
  }
}

export {};
