import cors from 'cors';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import env from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFound.js';
import { csrfProtection, exposeCsrfToken } from './middleware/csrf.js';
import authRoutes from './modules/auth/auth.routes.js';
import artisanRoutes from './modules/artisans/artisans.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import './shared/types.js';

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
  }),
);

app.use(
  cors({
    origin: env.CORS_ORIGIN.split(',').map((value) => value.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  }),
);

app.use(express.json({ limit: '1mb' }));
app.use(
  session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: env.COOKIE_SAME_SITE,
      secure: env.COOKIE_SECURE,
      maxAge: 1000 * 60 * 60 * 12,
    },
  }),
);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/v1/csrf-token', exposeCsrfToken, (req, res) => {
  res.json({ csrfToken: res.locals.csrfToken });
});

app.use((req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  return csrfProtection(req, res, next);
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/artisans', artisanRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
