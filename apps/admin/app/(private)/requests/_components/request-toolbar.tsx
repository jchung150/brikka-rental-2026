'use client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import type { RequestListItem } from '@/@actions/requests/listRequests';
import type { Table } from '@tanstack/react-table';

interface RequestToolbarProps {
  table: Table<RequestListItem>;
  buildings: { id: number; name: string }[];
  currentFilters: {
    buildingId?: string;
    status?: string;
    requestType?: string;
  };
}

export function RequestToolbar({
  table,
  buildings,
  currentFilters,
}: RequestToolbarProps) {
  const router = useRouter();
  const [buildingFilter, setBuildingFilter] = useState(
    currentFilters.buildingId || ''
  );
  const [statusFilter, setStatusFilter] = useState(currentFilters.status || '');
  const [typeFilter, setTypeFilter] = useState(
    currentFilters.requestType || ''
  );

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(window.location.search);

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // 페이지를 1로 리셋
    params.delete('page');

    router.push(`/requests?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Select
          value={buildingFilter}
          onValueChange={(value) => {
            setBuildingFilter(value);
            handleFilterChange('buildingId', value);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="건물 고유 이름" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            {buildings.map((building) => (
              <SelectItem key={building.id} value={building.id.toString()}>
                {building.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={typeFilter}
          onValueChange={(value) => {
            setTypeFilter(value);
            handleFilterChange('requestType', value);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="요청 유형" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="COMPLAINT">민원</SelectItem>
            <SelectItem value="SUGGESTION">제안</SelectItem>
            <SelectItem value="INQUIRY">문의</SelectItem>
            <SelectItem value="REPAIR">수선</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            handleFilterChange('status', value);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="처리 상태" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="PENDING">미분류</SelectItem>
            <SelectItem value="IN_PROGRESS">처리중</SelectItem>
            <SelectItem value="COMPLETED">완료</SelectItem>
            <SelectItem value="CANCELED">보류</SelectItem>
            <SelectItem value="REJECTED">거부</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* <Button asChild>
        <Link href="/requests/new">
          <Plus className="mr-2 h-4 w-4" />
          신규 요청 등록
        </Link>
      </Button> */}
    </div>
  );
}
