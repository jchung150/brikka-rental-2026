import type { LeaseDetail } from '@/@actions/lease/getLeaseDetail';
import { formatters } from '@repo/common/formatters';
import { Strings } from '@repo/common/strings';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { EditLeaseDialog } from '../dialog/edit-lease-dialog';

interface BasicInfoSectionProps {
  lease: LeaseDetail;
}

export function BasicInfoSection({ lease }: BasicInfoSectionProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const building = lease.Unit.Building;
  const ownership = building.Ownerships[0];

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="font-semibold text-lg">기본 정보</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            수정
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <span className="font-medium text-gray-500 text-sm">건물명</span>
              <div className="mt-1 text-gray-900 text-sm">{building.name}</div>
            </div>

            <div>
              <span className="font-medium text-gray-500 text-sm">
                임대인 이름
              </span>
              <div className="mt-1 text-gray-900 text-sm">
                {ownership?.Landlord.name}
              </div>
            </div>

            <div>
              <span className="font-medium text-gray-500 text-sm">유닛명</span>
              <div className="mt-1 text-gray-900 text-sm">
                {lease.Unit.name}
              </div>
            </div>

            <div>
              <span className="font-medium text-gray-500 text-sm">
                계약 상태
              </span>
              <div className="mt-1 text-gray-900 text-sm">
                {Strings.leaseStatus[lease.status] || '-'}
              </div>
            </div>

            <div>
              <span className="font-medium text-gray-500 text-sm">
                입주 인원 수
              </span>
              <div className="mt-1 text-gray-900 text-sm">
                {lease.numberOfOccupants || 0}명
              </div>
            </div>

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
          </div>
        </CardContent>
      </Card>

      <EditLeaseDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        lease={lease}
      />
    </>
  );
}
