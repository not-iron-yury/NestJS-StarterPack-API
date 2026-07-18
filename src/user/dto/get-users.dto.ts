import { UserRole, UserStatus } from '@prisma/client';
import { z } from 'zod';

export const GetUsersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce.number().int().positive().max(100).default(20),

  role: z.enum(UserRole).optional(),

  status: z.enum(UserStatus).optional(),
});

export type GetUsersDto = z.infer<typeof GetUsersSchema>;
