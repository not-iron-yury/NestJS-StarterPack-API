import { UserRole, UserStatus } from '@prisma/client';

export type UserListItem = {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
};
