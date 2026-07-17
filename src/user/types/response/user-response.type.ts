import { UserRole, UserStatus } from '@prisma/client';

export type UserResponse = {
  id: string;
  email: string;

  role: UserRole;
  status: UserStatus;

  emailVerifiedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;

  profile: {
    firstName: string | null;
    phone: string | null;
    avatarUrl: string | null;
  };
};
