import { UserStatus } from '@prisma/client';

// слой Service / Controller
export type ChangeUserStatusInputData = {
  targetUserId: string;
  newStatus: UserStatus;
  actorUserId: string;
};
