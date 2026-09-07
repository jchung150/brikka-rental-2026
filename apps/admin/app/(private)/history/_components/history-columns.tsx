'use client';

import type { ChangeHistoryEntity } from '@/@actions/history/listChangeHistories';
import { formatters } from '@repo/common/formatters';
import type { ColumnDef } from '@tanstack/react-table';

export const columns: ColumnDef<ChangeHistoryEntity>[] = [
  {
    accessorKey: 'createdAt',
    header: '변경일시',
    cell: ({ row }) => formatters.dateTime(row.original.createdAt),
  },
  {
    accessorKey: 'User.name',
    header: '수정한 사람',
  },
  {
    accessorKey: 'targetType',
    header: '대상 유형',
    cell: ({ row }) => {
      const typeMap = {
        BUILDING: '건물',
        UNIT: '유닛',
        LEASE: '계약',
        USER: '사용자',
        BILLING: '청구',
        PAYMENT: '수납',
        MESSAGE: '메시지',
      };
      return (
        typeMap[row.original.targetType as keyof typeof typeMap] ||
        row.original.targetType
      );
    },
  },
  {
    accessorKey: 'targetId',
    header: '대상 ID',
  },
  {
    accessorKey: 'changes',
    header: '변경 내용',
    cell: ({ row }) => {
      const changes = row.original.changes as Record<
        string,
        { before: string; after: string }
      >;
      return (
        <div className="text-sm">
          {Object.entries(changes).map(([field, value]) => (
            <div key={field}>
              <strong>{field}:</strong> {value.before} → {value.after}
            </div>
          ))}
        </div>
      );
    },
  },
];
