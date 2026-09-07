'use client';

import type { LeaseDetail } from '@/@actions/lease/getLeaseDetail';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
} from '@repo/design-system/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/design-system/components/ui/dropdown-menu';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { DeleteTenantDialog } from './delete-tenant-dialog';
import { EditTenantDialog } from './edit-tenant-dialog';
type LeaseTenant = LeaseDetail['LeaseTenants'][number];
interface TenantCardProps {
  tenant: LeaseTenant;
}

export function TenantCard({ tenant }: TenantCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <Card className="relative">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg">{tenant.Tenant.name}</h3>
            {tenant.isRepresentative && (
              <Badge variant="secondary" className="text-xs">
                대표 입주자
              </Badge>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                수정
              </DropdownMenuItem>
              {!tenant.isRepresentative && (
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  삭제
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <span className="font-medium text-gray-500 text-sm">
              주민등록번호
            </span>
            <div className="mt-1 text-gray-900 text-sm">
              {tenant.Tenant.ssn}
            </div>
          </div>
          <div>
            <span className="font-medium text-gray-500 text-sm">연락처</span>
            <div className="mt-1 text-gray-900 text-sm">
              {tenant.Tenant.phoneNumber}
            </div>
          </div>
          <div>
            <span className="font-medium text-gray-500 text-sm">이메일</span>
            <div className="mt-1 text-gray-900 text-sm">
              {tenant.Tenant.email}
            </div>
          </div>
          <div>
            <span className="font-medium text-gray-500 text-sm">주소</span>
            <div className="mt-1 text-gray-900 text-sm">
              {tenant.Tenant.address}
              {tenant.Tenant.addressDetail && ` ${tenant.Tenant.addressDetail}`}
            </div>
          </div>
        </CardContent>
      </Card>

      <EditTenantDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        leaseTenant={tenant}
      />

      <DeleteTenantDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        tenant={tenant}
      />
    </>
  );
}
