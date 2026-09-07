'use client';
import { useBuildingsList } from '@/@hooks/use-buildings';
import { PagingTable } from '@/components/data-table/paging-table';
import type { SortingState } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { BuildingDetailDialogs } from './[id]/_components/building-detail-dialogs';
import { EmptyBuildingDetailProvider } from './[id]/context';
import { columns } from './_components/building-columns';
import { BuildingsToolbar } from './_components/building-toolbar';
import { BuildingDialogs } from './_components/edit-building-dialog';
import { BuildingsProvider } from './context';

export default function BuildingsPage() {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'id', desc: true },
  ]);
  const [page, setPage] = useState(1);
  const params = useMemo(() => {
    return {
      sortBy: sorting[0].id,
      sortOrder: sorting[0].desc ? 'desc' : 'asc',
    };
  }, [sorting]);
  const { data, isLoading, error, refetch } = useBuildingsList(page, params);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <EmptyBuildingDetailProvider>
      <BuildingsProvider>
        <PagingTable
          Toolbar={BuildingsToolbar}
          columns={columns}
          data={data?.items ?? []}
          sorting={sorting}
          setSorting={setSorting}
          page={data?.page ?? 1}
          setPage={setPage}
          lastPage={data?.lastPage ?? 1}
        />
        <BuildingDialogs />
      </BuildingsProvider>
      <BuildingDetailDialogs />
    </EmptyBuildingDetailProvider>
  );
}
