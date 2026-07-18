import { UserRole } from '@prisma/client';
import { z } from 'zod';

export const ChangeUserRoleSchema = z.object({
  newRole: z.enum(UserRole),
});

export type ChangeUserRoleDto = z.infer<typeof ChangeUserRoleSchema>;
