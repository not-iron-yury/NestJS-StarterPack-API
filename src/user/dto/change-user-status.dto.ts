import { UserStatus } from '@prisma/client';
import { z } from 'zod';

export const ChangeUserStatusSchema = z.object({
  newStatus: z.enum(UserStatus),
});

export type ChangeUserStatusDto = z.infer<typeof ChangeUserStatusSchema>;
