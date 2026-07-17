import { PasswordSchema } from 'src/auth/validation/password.schema';
import { z } from 'zod';

export const RequestPasswordChangeSchema = z.object({
  currentPassword: PasswordSchema,
});

export type RequestPasswordChangeDto = z.infer<
  typeof RequestPasswordChangeSchema
>;
