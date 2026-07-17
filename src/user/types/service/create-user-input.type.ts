import { UserProfileFields } from 'src/user/types';

// слой Service
export type CreateUserInputData = {
  email: string;
  passwordHash: string;
} & UserProfileFields;
