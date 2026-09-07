'use client';

import type { TenantDetail } from '@/@actions/tenants/getTenantDetail';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import { Edit, Mail, MapPin, Phone, Users } from 'lucide-react';

interface SummaryTabProps {
  tenant: TenantDetail;
}

export function SummaryTab({ tenant }: SummaryTabProps) {
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
                <span className="font-medium text-sm">입주자명</span>
              </div>
              <p className="text-sm">{tenant.name}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">이메일</span>
              </div>
              <p className="text-sm">{tenant.email}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">연락처</span>
              </div>
              <p className="text-sm">{tenant.phoneNumber || '-'}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">주소</span>
              </div>
              <p className="text-sm">
                {tenant.address
                  ? `${tenant.address} ${tenant.addressDetail || ''}`
                  : '-'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
