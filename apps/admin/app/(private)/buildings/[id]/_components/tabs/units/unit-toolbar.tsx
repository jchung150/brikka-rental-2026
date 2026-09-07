'use client';

import type { UnitListItem } from '@/@data/unit';
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

interface UnitToolbarProps {
  table: Table<UnitListItem>;
  onAddUnit: () => void;
}

export function UnitToolbar({ table, onAddUnit }: UnitToolbarProps) {
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
            <SelectValue placeholder="유닛 상태" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="VACANT">공실</SelectItem>
            <SelectItem value="OCCUPIED">사용중</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" className="h-8">
          <Download className="mr-2 h-4 w-4" />
          다운로드
        </Button>
        <Button size="sm" className="h-8" onClick={onAddUnit} variant="default">
          <Plus className="mr-2 h-4 w-4" />
          신규 유닛 등록
        </Button>
      </div>
    </div>
  );
}
