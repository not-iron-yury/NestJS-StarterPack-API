import z from 'zod';
import { EmailSchema } from '../validation/email.schema.ts';
import { PasswordSchema } from '../validation/password.schema';

export const CredentialsSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
});

export type LoginDto = z.infer<typeof CredentialsSchema>;
export type RegisterDto = z.infer<typeof CredentialsSchema>;
