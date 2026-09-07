import type { BillListItem } from '@/@actions/bills/listBills';
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
import { MessageSquare, Send } from 'lucide-react';

export type UnpaidBillFilterLeaseStatus =
  | 'PREPARING'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'TERMINATED'
  | 'all';

export type UnpaidBillFilterBillStatus = 'UNPAID' | 'OVERDUE' | 'all';

interface UnpaidBillToolbarProps {
  table: Table<BillListItem>;
  buildingId?: string;
  setBuildingId: (value: string | undefined) => void;
  leaseStatus?: UnpaidBillFilterLeaseStatus;
  setLeaseStatus: (value: UnpaidBillFilterLeaseStatus) => void;
  billStatus?: UnpaidBillFilterBillStatus;
  setBillStatus: (value: UnpaidBillFilterBillStatus) => void;
  onSendNotifications: () => void;
}

export function UnpaidBillToolbar({
  buildingId,
  setBuildingId,
  leaseStatus,
  setLeaseStatus,
  billStatus,
  setBillStatus,
  onSendNotifications,
}: UnpaidBillToolbarProps) {
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
            value={leaseStatus}
            onValueChange={(value) =>
              setLeaseStatus(value as UnpaidBillFilterLeaseStatus)
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
            value={billStatus}
            onValueChange={(value) =>
              setBillStatus(value as UnpaidBillFilterBillStatus)
            }
          >
            <SelectTrigger className="h-8 w-[150px]">
              <SelectValue placeholder="납부 상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="UNPAID">미납</SelectItem>
              <SelectItem value="OVERDUE">연체</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 액션 버튼들 */}
      <div className="flex items-center space-x-2">
        <Button size="sm" className="h-8" variant="outline">
          <MessageSquare className="mr-2 h-4 w-4" />
          알림 처리
        </Button>
        <Button
          size="sm"
          className="h-8"
          variant="outline"
          onClick={onSendNotifications}
        >
          <Send className="mr-2 h-4 w-4" />
          알림톡 일괄 발송
        </Button>
      </div>
    </div>
  );
}
