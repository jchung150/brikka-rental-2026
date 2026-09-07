import { listUsersForSelect } from '@/@actions/users/listUsers';
import type { UserRole } from '@repo/database';
import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from './query-keys';

export const useUsers = (filter?: UserRole[]) => {
  const { data: users } = useQuery({
    queryKey: QueryKeys.User.List(filter),
    queryFn: () => listUsersForSelect(filter),
  });

  if (!users?.ok) {
    return [];
  }

  return users?.data ?? [];
};
