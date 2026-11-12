import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().optional(),
  role: z.enum(['CUSTOMER', 'ARTISAN']).default('CUSTOMER'),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const artisanRegistrationSchema = registerSchema.extend({
  businessName: z.string().min(2),
  city: z.string().min(2),
  region: z.string().min(2),
  skill: z.string().min(2),
});
