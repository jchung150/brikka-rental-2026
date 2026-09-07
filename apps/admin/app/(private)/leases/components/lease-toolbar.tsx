import type { LeaseListItem } from '@/@actions/lease/listLeases';
import { useBuildings } from '@/@hooks/use-buildings';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import type { Table } from '@tanstack/react-table';
import { Download, Plus } from 'lucide-react';
import Link from 'next/link';

export type LeaseFilterStatus =
  | 'PREPARING'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'TERMINATED'
  | 'all';

export type LeaseFilterRemainingDays =
  | 'expired'
  | 'urgent'
  | 'upcoming'
  | 'normal'
  | 'all';

export type LeaseFilterRenewalNotice = 'overdue' | 'urgent' | 'normal' | 'all';

interface LeaseToolbarProps {
  table: Table<LeaseListItem>;
  buildingId?: string;
  setBuildingId: (value: string | undefined) => void;
  status?: LeaseFilterStatus;
  setStatus: (value: LeaseFilterStatus) => void;
  remainingDaysFilter?: LeaseFilterRemainingDays;
  setRemainingDaysFilter: (value: LeaseFilterRemainingDays) => void;
  renewalNoticeFilter?: LeaseFilterRenewalNotice;
  setRenewalNoticeFilter: (value: LeaseFilterRenewalNotice) => void;
}

export function LeaseToolbar({
  buildingId,
  setBuildingId,
  status,
  setStatus,
  remainingDaysFilter,
  setRemainingDaysFilter,
  renewalNoticeFilter,
  setRenewalNoticeFilter,
}: LeaseToolbarProps) {
  const { data: buildings } = useBuildings();
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <div className="flex items-center space-x-2">
          <Select
            value={buildingId}
            onValueChange={(value) =>
              setBuildingId(value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger className="h-8 w-[200px]">
              <SelectValue placeholder="건물명" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              {buildings?.map((building) => (
                <SelectItem key={building.id} value={building.id.toString()}>
                  {building.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={status}
            onValueChange={(value) => setStatus(value as LeaseFilterStatus)}
          >
            <SelectTrigger className="h-8 w-[150px]">
              <SelectValue placeholder="계약 상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="PREPARING">준비중</SelectItem>
              <SelectItem value="ACTIVE">진행중</SelectItem>
              <SelectItem value="TERMINATED">종료됨</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={remainingDaysFilter}
            onValueChange={(value) =>
              setRemainingDaysFilter(value as LeaseFilterRemainingDays)
            }
          >
            <SelectTrigger className="h-8 w-[200px]">
              <SelectValue placeholder="계약 만료 남은 일수" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="expired">만료됨</SelectItem>
              <SelectItem value="urgent">3일 이내</SelectItem>
              <SelectItem value="upcoming">30일 이내</SelectItem>
              <SelectItem value="normal">30일 이후</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={renewalNoticeFilter}
            onValueChange={(value) =>
              setRenewalNoticeFilter(value as LeaseFilterRenewalNotice)
            }
          >
            <SelectTrigger className="h-8 w-[200px]">
              <SelectValue placeholder="갱신 통지 마감 남은 일수" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="overdue">마감일 경과</SelectItem>
              <SelectItem value="urgent">30일 이내</SelectItem>
              <SelectItem value="normal">30일 이후</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 액션 버튼들 */}
      <div className="flex items-center space-x-2">
        <Link href="/leases/new">
          <Button size="sm" className="h-8" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            신규 계약 등록
          </Button>
        </Link>
        <Button size="sm" variant="outline" className="h-8">
          <Download className="mr-2 h-4 w-4" />
          다운로드
        </Button>
      </div>
    </div>
  );
}
