import { UserRole } from '@prisma/client';

// слой Service / Controller
export type ChangeUserRoleInputData = {
  targetUserId: string;
  newRole: UserRole;
  actorUserId: string;
};
