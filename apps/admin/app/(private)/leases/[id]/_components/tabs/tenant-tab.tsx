'use client';
import { Button } from '@repo/design-system/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useLeaseDetail } from '../context';
import { AddTenantDialog } from './add-tenant-dialog';
import { TenantCard } from './tenant-card';

export function TenantTab() {
  const { detail } = useLeaseDetail();
  const tenants = detail.LeaseTenants;
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">입주자 정보</h2>
        <Button onClick={() => setIsAddDialogOpen(true)} variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          신규 입주자 추가
        </Button>
      </div>

      {tenants.length === 0 && (
        <div className="flex items-center justify-center rounded-md bg-muted p-4 py-12">
          <p className="text-gray-500">입주자 정보가 없습니다.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tenants.map((tenant) => (
          <TenantCard key={tenant.id} tenant={tenant} />
        ))}
      </div>

      <AddTenantDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}
