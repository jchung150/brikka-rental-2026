'use client';

import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Strings } from '@repo/common/strings';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar, Eye, Mail, Phone } from 'lucide-react';
import Link from 'next/link';

export interface Contact {
  id: bigint;
  name: string;
  email: string | null;
  phoneNumber: string | null;
  howDidYouFind: string | null;
  memo: string | null;
  reservationTime: Date;
  status: string;
  adminMemo: string | null;
  dong: string | null;
  type: string | null;
  createdAt: Date;
}

const statusLabels = {
  PENDING: { label: '대기중', variant: 'secondary' as const },
  CONFIRMED: { label: '확정', variant: 'default' as const },
  COMPLETED: { label: '완료', variant: 'success' as const },
  CANCELLED: { label: '취소', variant: 'destructive' as const },
};

export const contactColumns: ColumnDef<Contact>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="예약자" />
    ),
    cell: ({ row }) => {
      const contact = row.original;
      return (
        <div>
          <div className="font-medium">{contact.name}</div>
          {contact.memo && (
            <div className="max-w-[200px] truncate text-muted-foreground text-sm">
              {contact.memo}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'dong',
    header: '동',
    cell: ({ row }) => {
      const contact = row.original;
      return <div className="text-sm">{`${contact.dong}동` || '-'}</div>;
    },
  },
  {
    accessorKey: 'type',
    header: '유형',
    cell: ({ row }) => {
      const contact = row.original;
      return (
        <div className="text-sm">
          {Strings.contactType[
            contact.type as keyof typeof Strings.contactType
          ] ?? '-'}
        </div>
      );
    },
  },
  {
    accessorKey: 'contact',
    header: '연락처',
    cell: ({ row }) => {
      const contact = row.original;
      return (
        <div className="space-y-1">
          {contact.email && (
            <div className="flex items-center gap-1 text-sm">
              <Mail className="h-3 w-3" />
              {contact.email}
            </div>
          )}
          {contact.phoneNumber && (
            <div className="flex items-center gap-1 text-sm">
              <Phone className="h-3 w-3" />
              {contact.phoneNumber}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'reservationTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="예약 시간" />
    ),
    cell: ({ row }) => {
      const contact = row.original;
      return (
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {format(new Date(contact.reservationTime), 'MM/dd HH:mm', {
            locale: ko,
          })}
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="상태" />
    ),
    cell: ({ row }) => {
      const contact = row.original;
      const statusInfo =
        statusLabels[contact.status as keyof typeof statusLabels] ||
        statusLabels.PENDING;

      return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
    },
  },
  {
    accessorKey: 'howDidYouFind',
    header: '알게된 경로',
    cell: ({ row }) => {
      const contact = row.original;
      return <div className="text-sm">{contact.howDidYouFind || '-'}</div>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="등록일" />
    ),
    cell: ({ row }) => {
      const contact = row.original;
      return (
        <div className="text-muted-foreground text-sm">
          {format(new Date(contact.createdAt), 'MM/dd', { locale: ko })}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: '관리',
    cell: ({ row }) => {
      const contact = row.original;
      return (
        <Button asChild size="sm" variant="outline">
          <Link href={`/contacts/${contact.id}`}>
            <Eye className="mr-1 h-4 w-4" />
            상세보기
          </Link>
        </Button>
      );
    },
  },
];
