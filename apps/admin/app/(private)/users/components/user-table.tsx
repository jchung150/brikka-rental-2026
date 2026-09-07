'use client';

import type { UserListItem } from '@/@actions/users/listUsers';
import { DataTable } from '@/components/data-table/data-table';
import type { UserRole } from '@repo/database';
import { createUserColumns } from './user-columns';
import { UserListToolbar } from './user-list-toolbar';

export function UserTable({
  users,
  type,
}: { users: UserListItem[]; type: UserRole }) {
  const userColumns = createUserColumns();

  return (
    <DataTable
      columns={userColumns}
      data={users}
      Toolbar={({ table }) => <UserListToolbar table={table} type={type} />}
      defaultColumnFilters={[{ id: 'userRole', value: type }]}
    />
  );
}
