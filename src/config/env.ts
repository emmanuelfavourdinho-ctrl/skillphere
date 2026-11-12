import dotenv from 'dotenv';

dotenv.config();

const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 4000),
  DATABASE_URL: process.env.DATABASE_URL ?? 'postgresql://trusttrade:trusttrade@localhost:5432/trusttrade?schema=public',
  SESSION_SECRET: process.env.SESSION_SECRET ?? 'local-dev-secret',
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  COOKIE_SECURE: (process.env.COOKIE_SECURE ?? 'false') === 'true',
  COOKIE_SAME_SITE: (process.env.COOKIE_SAME_SITE ?? 'lax') as 'lax' | 'strict' | 'none',
};

export default env;
