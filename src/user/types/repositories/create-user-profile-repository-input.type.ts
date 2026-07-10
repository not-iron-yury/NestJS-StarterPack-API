import { UserProfileFields } from 'src/user/types';

export type CreateUserProfileRepositoryInput = {
  userId: string;
} & UserProfileFields;
