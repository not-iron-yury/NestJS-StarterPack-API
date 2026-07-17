import { z } from 'zod';
import { EmailSchema } from '../validation/email.schema.ts';

export const RequestPasswordResetSchema = z.object({
  email: EmailSchema,
});

export type RequestPasswordResetDto = z.infer<
  typeof RequestPasswordResetSchema
>;
