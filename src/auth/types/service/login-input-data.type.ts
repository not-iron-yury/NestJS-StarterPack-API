import { LoginDto } from 'src/auth/dto';

export type LoginInputData = {
  ip: string;
} & LoginDto;
