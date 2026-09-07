'use client';

import { useChangeHistories } from '@/@hooks/use-change-histories';
import { DataTable } from '@/components/data-table/data-table';
import { columns } from './_components/history-columns';

export default function HistoryPage() {
  const { data, isLoading } = useChangeHistories();

  if (isLoading) return <div>로딩 중...</div>;

  return (
    <div className="container py-6">
      <h1 className="mb-6 font-bold text-2xl">변경 이력</h1>
      <DataTable columns={columns} data={data ?? []} />
    </div>
  );
}
