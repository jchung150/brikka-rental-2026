'use client';

import type { LandlordDetail } from '@/@actions/landlords/getLandlordDetail';
import { formatters } from '@repo/common/formatters';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import {
  Building,
  Calendar,
  CreditCard,
  Edit,
  Mail,
  MapPin,
  Phone,
  Users,
} from 'lucide-react';

interface SummaryTabProps {
  landlord: LandlordDetail;
}

function getContractStatus(
  startDate: Date | null,
  endDate: Date | null
): { status: string; label: string; variant: string } {
  if (!startDate || !endDate) {
    return {
      status: 'none',
      label: '없음',
      variant: 'outline',
    };
  }

  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) {
    return {
      status: 'upcoming',
      label: '예정',
      variant: 'secondary',
    };
  }
  if (now > end) {
    return {
      status: 'expired',
      label: '만료',
      variant: 'destructive',
    };
  }
  return {
    status: 'active',
    label: '진행중',
    variant: 'default',
  };
}

export function SummaryTab({ landlord }: SummaryTabProps) {
  const contractStatus = getContractStatus(
    landlord.managementContractStartDate,
    landlord.managementContractEndDate
  );

  return (
    <div className="space-y-6">
      {/* 기본 정보 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="font-semibold text-lg">기본 정보</CardTitle>
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            수정
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">임대인명</span>
              </div>
              <p className="text-sm">{landlord.name}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">이메일</span>
              </div>
              <p className="text-sm">{landlord.email}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">연락처</span>
              </div>
              <p className="text-sm">{landlord.phoneNumber || '-'}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">주소</span>
              </div>
              <p className="text-sm">
                {landlord.address
                  ? `${landlord.address} ${landlord.addressDetail || ''}`
                  : '-'}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">계좌 정보</span>
              </div>
              <p className="text-sm">
                {landlord.accountBank && landlord.accountNumber
                  ? `${landlord.accountBank} ${landlord.accountNumber}`
                  : '-'}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">소유 건물 수</span>
              </div>
              <p className="text-sm">{landlord.BuildingOwnerships.length}개</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 관리 위임계약 정보 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="font-semibold text-lg">관리 위임계약</CardTitle>
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            수정
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">계약 상태</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={contractStatus.variant as any}>
                  {contractStatus.label}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">계약 기간</span>
              </div>
              <p className="text-sm">
                {landlord.managementContractStartDate &&
                landlord.managementContractEndDate
                  ? `${formatters.date(landlord.managementContractStartDate)} ~ ${formatters.date(landlord.managementContractEndDate)}`
                  : '-'}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">계약 시작일</span>
              </div>
              <p className="text-sm">
                {landlord.managementContractStartDate
                  ? formatters.dateTime(landlord.managementContractStartDate)
                  : '-'}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">계약 종료일</span>
              </div>
              <p className="text-sm">
                {landlord.managementContractEndDate
                  ? formatters.dateTime(landlord.managementContractEndDate)
                  : '-'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
