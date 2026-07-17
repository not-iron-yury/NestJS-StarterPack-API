import { UserRole, UserStatus } from '@prisma/client';

export type GetUsersInputData = {
  page: number;
  limit: number;
  role?: UserRole;
  status?: UserStatus;
};
