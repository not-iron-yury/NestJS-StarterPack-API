import { UserListItem } from 'src/user/types';

export type UsersResponse = {
  items: UserListItem[];
  total: number;
  page: number;
  limit: number;
};
