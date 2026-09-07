'use client';

import { PagingTable } from '@/components/data-table/paging-table';
import type { SortingState } from '@tanstack/react-table';
import { useState } from 'react';
import type { Contact } from './contacts-columns';
import { contactColumns } from './contacts-columns';

interface ContactsTableProps {
  initialData: {
    contacts: Contact[];
    total: number;
    page: number;
    limit: number;
  };
}

export function ContactsTable({ initialData }: ContactsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'reservationTime', desc: true },
  ]);
  const [page, setPage] = useState(initialData.page);

  const lastPage = Math.ceil(initialData.total / initialData.limit);

  if (initialData.contacts.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500 text-lg">문의가 없습니다.</div>
      </div>
    );
  }

  return (
    <PagingTable
      columns={contactColumns}
      data={initialData.contacts}
      // Toolbar={ContactsToolbar}
      sorting={sorting}
      setSorting={setSorting}
      page={page}
      setPage={setPage}
      lastPage={lastPage}
    />
  );
}
