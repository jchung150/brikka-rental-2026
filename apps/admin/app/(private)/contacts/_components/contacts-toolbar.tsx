'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import type { Table } from '@tanstack/react-table';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import type { Contact } from './contacts-columns';

interface ContactsToolbarProps {
  table: Table<Contact>;
}

export function ContactsToolbar({ table }: ContactsToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [status, setStatus] = useState(searchParams.get('status') || 'ALL');
  const [startDate, setStartDate] = useState(
    searchParams.get('startDate') || ''
  );
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');

  const handleFilterChange = () => {
    startTransition(() => {
      const params = new URLSearchParams();

      if (status && status !== 'ALL') params.set('status', status);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);

      router.push(`/contacts?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    setStatus('ALL');
    setStartDate('');
    setEndDate('');
    router.push('/contacts');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="status">상태</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              <SelectItem value="PENDING">대기중</SelectItem>
              <SelectItem value="CONFIRMED">확정</SelectItem>
              <SelectItem value="COMPLETED">완료</SelectItem>
              <SelectItem value="CANCELLED">취소</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate">시작일</Label>
          <Input
            id="startDate"
            type="date"
            className="h-9"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">종료일</Label>
          <Input
            id="endDate"
            type="date"
            className="h-9"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="flex items-end gap-2">
          <Button
            onClick={handleFilterChange}
            disabled={isPending}
            className="h-9"
          >
            적용
          </Button>
          <Button variant="outline" onClick={clearFilters} className="h-9">
            초기화
          </Button>
        </div>
      </div>
    </div>
  );
}
