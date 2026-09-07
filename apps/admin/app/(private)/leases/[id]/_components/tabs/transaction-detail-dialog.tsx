'use client';

import type { LeaseLedgerTransaction } from '@/@actions/lease/getLeaseLedger';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/design-system/components/ui/dialog';

interface TransactionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: LeaseLedgerTransaction | null;
}

export function TransactionDetailDialog({
  open,
  onOpenChange,
  transaction,
}: TransactionDetailDialogProps) {
  const formatCurrency = (amount: number) => {
    if (amount === 0) return '-';
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'RECEIPT':
        return '수납';
      case 'BILLING':
        return '청구';
      default:
        return '알 수 없음';
    }
  };

  const getTransactionTypeVariant = (type: string) => {
    switch (type) {
      case 'RECEIPT':
        return 'default';
      case 'BILLING':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>거래 상세 정보</DialogTitle>
          <DialogDescription>
            거래 내역의 상세 정보를 확인할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-gray-500 text-sm">
                거래 유형
              </label>
              <div className="mt-1">
                <Badge
                  variant={getTransactionTypeVariant(
                    transaction.transactionType
                  )}
                >
                  {getTransactionTypeLabel(transaction.transactionType)}
                </Badge>
              </div>
            </div>
            <div>
              <label className="font-medium text-gray-500 text-sm">
                거래일
              </label>
              <div className="mt-1 text-sm">{formatDate(transaction.date)}</div>
            </div>
          </div>

          <div>
            <label className="font-medium text-gray-500 text-sm">
              청구항목
            </label>
            <div className="mt-1 text-sm">{transaction.billingItem}</div>
          </div>

          <div>
            <label className="font-medium text-gray-500 text-sm">
              거래 번호
            </label>
            <div className="mt-1 text-sm">{transaction.referenceNumber}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-gray-500 text-sm">
                증가 금액
              </label>
              <div className="mt-1 font-medium text-green-600 text-sm">
                {formatCurrency(transaction.increase)}
              </div>
            </div>
            <div>
              <label className="font-medium text-gray-500 text-sm">
                감소 금액
              </label>
              <div className="mt-1 font-medium text-red-600 text-sm">
                {formatCurrency(transaction.decrease)}
              </div>
            </div>
          </div>

          <div>
            <label className="font-medium text-gray-500 text-sm">잔액</label>
            <div className="mt-1 font-semibold text-lg">
              {formatCurrency(transaction.balance)}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
