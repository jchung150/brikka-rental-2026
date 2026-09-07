import type { LeaseDetail } from '@/@actions/lease/getLeaseDetail';
import { formatters } from '@repo/common/formatters';
import { Strings } from '@repo/common/strings';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';

interface ContractInfoSectionProps {
  lease: LeaseDetail;
}

export function ContractInfoSection({ lease }: ContractInfoSectionProps) {
  const tenant = lease.LeaseTenants[0];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="font-semibold text-lg">계약자 정보</CardTitle>
        {/* <Button variant="outline" size="sm">
          <Pencil className="mr-2 h-4 w-4" />
          수정
        </Button> */}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <span className="font-medium text-gray-500 text-sm">
              대표 입주자 이름
            </span>
            <div className="mt-1 text-gray-900 text-sm">
              {tenant?.Tenant.name || '-'}
            </div>
          </div>

          <div>
            <span className="font-medium text-gray-500 text-sm">계약 상태</span>
            <div className="mt-1 text-gray-900 text-sm">
              {Strings.leaseStatus[lease.status] || '-'}
            </div>
          </div>

          {/* <div>
            <span className="font-medium text-gray-500 text-sm">계약 유형</span>
            <div className="mt-1 text-gray-900 text-sm">
              {getContractTypeLabel(lease.contractType)}
            </div>
          </div> */}

          <div>
            <span className="font-medium text-gray-500 text-sm">
              계약 시작일
            </span>
            <div className="mt-1 text-gray-900 text-sm">
              {formatters.date(lease.startDate)}
            </div>
          </div>

          <div>
            <span className="font-medium text-gray-500 text-sm">
              계약 종료일
            </span>
            <div className="mt-1 text-gray-900 text-sm">
              {formatters.date(lease.endDate)}
            </div>
          </div>

          {/* <div>
            <span className="font-medium text-gray-500 text-sm">잔액</span>
            <div className="mt-1 text-gray-900 text-sm">
              {formatters.currency(1000)}
            </div>
          </div> */}
          {/* 
          <div>
            <span className="font-medium text-gray-500 text-sm">
              임대료(약정액)
            </span>
            <div className="mt-1 text-gray-900 text-sm">
              {formatCurrency(lease.rent)}
            </div>
          </div> */}

          {/* <div>
            <span className="font-medium text-gray-500 text-sm">
              보증금(약정액)
            </span>
            <div className="mt-1 text-gray-900 text-sm">
              {formatCurrency(lease.deposit)}
            </div>
          </div>

          <div>
            <span className="font-medium text-gray-500 text-sm">
              반환 예정일
            </span>
            <div className="mt-1 text-gray-900 text-sm">
              {formatCurrency(lease.deposit)}
            </div>
          </div> */}
        </div>
      </CardContent>
    </Card>
  );
}
