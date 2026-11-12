import { z } from 'zod';

export const artisanQuerySchema = z.object({
  skill: z.string().optional(),
  location: z.string().optional(),
  verificationStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'EXPIRED']).optional(),
  minExperience: z.coerce.number().min(0).optional(),
  availability: z.enum(['AVAILABLE', 'BUSY', 'UNAVAILABLE']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(12),
  sort: z.enum(['relevance', 'experience', 'rating']).default('relevance'),
});
