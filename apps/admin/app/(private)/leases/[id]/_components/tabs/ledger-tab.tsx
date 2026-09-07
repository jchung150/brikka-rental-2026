'use client';

import type { LeaseDetail } from '@/@actions/lease/getLeaseDetail';
import type { LeaseLedgerTransaction } from '@/@actions/lease/getLeaseLedger';
import { DataTable } from '@/components/data-table/data-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import { useState } from 'react';
import { createLedgerColumns } from './ledger-columns';
import { TransactionDetailDialog } from './transaction-detail-dialog';

interface LedgerTabProps {
  lease: LeaseDetail;
}

// 임시 데이터 (실제로는 Server Action에서 조회)
const mockTransactions: LeaseLedgerTransaction[] = [
  {
    id: '1',
    date: '2025-05-29T00:00:00Z',
    transactionType: 'RECEIPT',
    billingItem: '임대료 | 주차비 | 소독비',
    referenceNumber: '1540',
    increase: 0,
    decrease: 1275000,
    balance: 0,
  },
  {
    id: '2',
    date: '2025-05-29T00:00:00Z',
    transactionType: 'BILLING',
    billingItem: '소독비',
    referenceNumber: '-',
    increase: 30000,
    decrease: 0,
    balance: 1280000,
  },
  {
    id: '3',
    date: '2025-05-29T00:00:00Z',
    transactionType: 'BILLING',
    billingItem: '주차비',
    referenceNumber: '-',
    increase: 50000,
    decrease: 0,
    balance: 1250000,
  },
  {
    id: '4',
    date: '2025-05-29T00:00:00Z',
    transactionType: 'BILLING',
    billingItem: '임대료',
    referenceNumber: '-',
    increase: 1200000,
    decrease: 0,
    balance: 1200000,
  },
  {
    id: '5',
    date: '2025-05-29T00:00:00Z',
    transactionType: 'RECEIPT',
    billingItem: '임대료 | 주차비 | 소독비',
    referenceNumber: '3923',
    increase: 0,
    decrease: 1280000,
    balance: 0,
  },
];

const filterOptions = [
  { value: 'ALL', label: '모든 거래' },
  { value: 'RECEIPT', label: '수납만' },
  { value: 'BILLING', label: '청구만' },
];

export function LedgerTab({ lease: _lease }: LedgerTabProps) {
  const [transactions, setTransactions] =
    useState<LeaseLedgerTransaction[]>(mockTransactions);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [selectedTransaction, setSelectedTransaction] =
    useState<LeaseLedgerTransaction | null>(null);

  const handleFilterChange = (value: string) => {
    setFilterType(value);

    // 실제로는 Server Action을 호출하여 필터링된 데이터를 가져옴
    if (value === 'ALL') {
      setTransactions(mockTransactions);
    } else if (value === 'RECEIPT') {
      setTransactions(
        mockTransactions.filter((t) => t.transactionType === 'RECEIPT')
      );
    } else if (value === 'BILLING') {
      setTransactions(
        mockTransactions.filter((t) => t.transactionType === 'BILLING')
      );
    }
  };

  const handleViewDetails = (transaction: LeaseLedgerTransaction) => {
    setSelectedTransaction(transaction);
  };

  const columns = createLedgerColumns({
    onViewDetails: handleViewDetails,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">원장 정보</h2>
        <div className="flex items-center gap-2">
          <Select value={filterType} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="필터 선택" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable columns={columns} data={transactions} pageSize={10} />

      <TransactionDetailDialog
        open={!!selectedTransaction}
        onOpenChange={(open) => !open && setSelectedTransaction(null)}
        transaction={selectedTransaction}
      />
    </div>
  );
}
