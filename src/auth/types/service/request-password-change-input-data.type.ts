import { RequestPasswordChangeDto } from 'src/auth/dto';

export type RequestPasswordChangeInputData = {
  userId: string;
} & RequestPasswordChangeDto;
