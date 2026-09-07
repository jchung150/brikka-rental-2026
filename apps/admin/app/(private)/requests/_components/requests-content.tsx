'use client';
import { useBuildings } from '@/@hooks/use-buildings';
import { useRequests } from '@/@hooks/use-requests';
import { PagingTable } from '@/components/data-table/paging-table';
import type { RequestStatus } from '@repo/database/generated/client';
import { requestColumns } from './request-columns';
import { RequestToolbar } from './request-toolbar';

export function RequestsContent({
  searchParams,
}: {
  searchParams: {
    page?: string;
    buildingId?: string;
    status?: string;
    requestType?: string;
  };
}) {
  const searchPage = searchParams.page ? Number(searchParams.page) : 1;
  const searchBuildingId = searchParams.buildingId
    ? Number(searchParams.buildingId)
    : undefined;
  const searchStatus = searchParams.status ? searchParams.status : undefined;
  const searchRequestType = searchParams.requestType
    ? searchParams.requestType
    : undefined;

  const { data: buildings } = useBuildings();
  const { data: requests } = useRequests({
    buildingId: searchBuildingId,
    status: searchStatus as RequestStatus,
  });

  const requestItems = requests ?? [];
  const lastPage = 1; // TODO: useRequests hook should return pagination info

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl">요청 관리</h1>
        <p className="text-muted-foreground">
          입주자 및 건물주 요청을 관리하고 처리하세요.
        </p>
      </div>

      <PagingTable
        columns={requestColumns}
        data={requestItems}
        Toolbar={RequestToolbar}
        toolbarProps={{
          buildings: buildings ?? [],
          currentFilters: {
            buildingId: searchParams.buildingId,
            status: searchParams.status,
            requestType: searchParams.requestType,
          },
        }}
        sorting={[{ id: 'createdAt', desc: true }]}
        setSorting={() => {}} // 서버 사이드 정렬 사용
        page={searchPage}
        setPage={() => {}} // URL 파라미터로 페이지 관리
        lastPage={lastPage}
      />
    </div>
  );
}
