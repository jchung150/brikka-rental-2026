'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import type { Table } from '@tanstack/react-table';
import { Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';

interface TenantListToolbarProps {
  table: Table<any>;
  tenants: any[];
}

export function TenantListToolbar({ table, tenants }: TenantListToolbarProps) {
  const [searchValue, setSearchValue] = useState('');

  // 건물 목록 추출
  const buildings = useMemo(() => {
    const buildingSet = new Set<string>();
    tenants.forEach((tenant) => {
      if (tenant.lease?.unit?.building?.name) {
        buildingSet.add(tenant.lease.unit.building.name);
      }
    });
    return Array.from(buildingSet).sort();
  }, [tenants]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    // 이름으로 검색 (이메일, 연락처는 별도 필터로 구현 가능)
    table.getColumn('name')?.setFilterValue(value);
  };

  const clearSearch = () => {
    setSearchValue('');
    table.getColumn('name')?.setFilterValue('');
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {/* 검색 */}
        <div className="relative">
          <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="입주자 이름으로 검색..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-[300px] pl-8"
          />
          {searchValue && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute top-1 right-1 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* 건물 필터 */}
        <Select
          value={(table.getColumn('lease')?.getFilterValue() as string) ?? ''}
          onValueChange={(value) =>
            table
              .getColumn('lease')
              ?.setFilterValue(value === 'all' ? '' : value)
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="건물 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 건물</SelectItem>
            {buildings.map((building) => (
              <SelectItem key={building} value={building}>
                {building}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 계약 상태 필터 */}
        <Select
          value={
            (table.getColumn('leaseStatus')?.getFilterValue() as string) ?? ''
          }
          onValueChange={(value) =>
            table
              .getColumn('leaseStatus')
              ?.setFilterValue(value === 'all' ? '' : value)
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="계약 상태" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="PREPARING">준비중</SelectItem>
            <SelectItem value="ACTIVE">진행중</SelectItem>
            <SelectItem value="TERMINATED">종료</SelectItem>
          </SelectContent>
        </Select>

        {/* 입주자 포털 초대 여부 필터 */}
        <Select
          value={
            (table.getColumn('isPortalInvited')?.getFilterValue() as string) ??
            ''
          }
          onValueChange={(value) =>
            table
              .getColumn('isPortalInvited')
              ?.setFilterValue(value === 'all' ? '' : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="포털 초대 상태" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="true">초대됨</SelectItem>
            <SelectItem value="false">미초대</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
