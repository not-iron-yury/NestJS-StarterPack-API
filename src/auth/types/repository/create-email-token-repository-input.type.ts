import { EmailOperationType } from '@prisma/client';

export type CreateEmailTokenRepositoryInput = {
  userId: string;
  type: EmailOperationType;
  tokenHash: string;
  expiresAt: Date;
};
