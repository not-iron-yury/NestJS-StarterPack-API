import { UserRole, UserStatus } from '@prisma/client';

export type FindUsersRepositoryInput = {
  page: number;
  limit: number;
  role?: UserRole;
  status?: UserStatus;
};
