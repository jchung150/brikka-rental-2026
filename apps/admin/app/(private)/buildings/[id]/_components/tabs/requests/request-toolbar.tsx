'use client';

import type { RequestListItem } from '@/@actions/requests/listRequests';
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

interface RequestToolbarProps {
  table: Table<RequestListItem>;
  onAddRequest: () => void;
}

export function RequestToolbar({ table, onAddRequest }: RequestToolbarProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Select
          value={(table.getColumn('status')?.getFilterValue() as string) ?? ''}
          onValueChange={(value) =>
            table
              .getColumn('status')
              ?.setFilterValue(value === 'all' ? '' : value)
          }
        >
          <SelectTrigger className="h-8 w-[150px]">
            <SelectValue placeholder="처리 상태" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="PENDING">미분류</SelectItem>
            <SelectItem value="IN_PROGRESS">처리중</SelectItem>
            <SelectItem value="COMPLETED">완료</SelectItem>
            <SelectItem value="CANCELED">보류</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" className="h-8">
          <Download className="mr-2 h-4 w-4" />
          다운로드
        </Button>
        <Button size="sm" className="h-8" onClick={onAddRequest}>
          <Plus className="mr-2 h-4 w-4" />
          신규 요청 등록
        </Button>
      </div>
    </div>
  );
}
