import { PasswordSchema } from 'src/auth/validation/password.schema';
import { z } from 'zod';

export const UpdatePasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: PasswordSchema,
});

export type UpdatePasswordDto = z.infer<typeof UpdatePasswordSchema>;
