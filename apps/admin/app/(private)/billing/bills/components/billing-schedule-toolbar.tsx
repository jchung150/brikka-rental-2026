import type { BillingScheduleListItem } from '@/@actions/lease/listBillingSchedules';
import { useBuildings } from '@/@hooks/use-buildings';
import type { RecurrenceType } from '@repo/database/generated/client';
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

export type BillingScheduleFilterStatus =
  | 'PREPARING'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'TERMINATED'
  | 'all';

interface BillingScheduleToolbarProps {
  table: Table<BillingScheduleListItem>;
  buildingId?: string;
  setBuildingId: (value: string | undefined) => void;
  status?: BillingScheduleFilterStatus;
  setStatus: (value: BillingScheduleFilterStatus) => void;
  itemName?: string;
  setItemName: (value: string | undefined) => void;
  onAddSchedule: (type: RecurrenceType) => void;
}

export function BillingScheduleToolbar({
  buildingId,
  setBuildingId,
  status,
  setStatus,
  itemName,
  setItemName,
  onAddSchedule,
}: BillingScheduleToolbarProps) {
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
            <SelectTrigger className="h-8 w-[180px]">
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
            onValueChange={(value) =>
              setStatus(value as BillingScheduleFilterStatus)
            }
          >
            <SelectTrigger className="h-8 w-[150px]">
              <SelectValue placeholder="계약 상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="PREPARING">계약중</SelectItem>
              <SelectItem value="ACTIVE">계약완료</SelectItem>
              <SelectItem value="COMPLETED">계약종료</SelectItem>
              <SelectItem value="TERMINATED">계약해지</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={itemName || 'all'}
            onValueChange={(value) =>
              setItemName(value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger className="h-8 w-[150px]">
              <SelectValue placeholder="청구 항목" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="임대료">임대료</SelectItem>
              <SelectItem value="관리비">관리비</SelectItem>
              <SelectItem value="연체료">연체료</SelectItem>
              <SelectItem value="주차비">주차비</SelectItem>
            </SelectContent>
          </Select>

          {/* TODO: 청구 기간 DatePicker 추가 */}
        </div>
      </div>

      {/* 액션 버튼들 */}
      <div className="flex items-center space-x-2">
        <Button
          size="sm"
          className="h-8"
          variant="outline"
          onClick={() => onAddSchedule('ONE_TIME')}
        >
          <Plus className="mr-2 h-4 w-4" />
          일회성 청구 등록
        </Button>
        <Button
          size="sm"
          className="h-8"
          variant="outline"
          onClick={() => onAddSchedule('RECURRING')}
        >
          <Plus className="mr-2 h-4 w-4" />
          정기 청구 등록
        </Button>
        <Button size="sm" variant="outline" className="h-8">
          <Download className="mr-2 h-4 w-4" />
          다운로드
        </Button>
      </div>
    </div>
  );
}
