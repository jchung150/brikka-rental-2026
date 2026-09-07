'use client';

import type { TenantDetail } from '@/@actions/tenants/getTenantDetail';
import { useTenantDetail } from '../context';
import { DocumentsTab } from './documents-tab';
import { NotificationsTab } from './notifications-tab';
import { RequestsTab } from './requests-tab';
import { SummaryTab } from './summary-tab';
import { TenantTabs } from './tenant-tabs';

interface TenantDetailClientProps {
  tenant: TenantDetail;
}

export function TenantDetailClient({ tenant }: TenantDetailClientProps) {
  const { activeTab } = useTenantDetail();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return <SummaryTab tenant={tenant} />;
      case 'requests':
        return <RequestsTab tenant={tenant} />;
      case 'documents':
        return <DocumentsTab tenant={tenant} />;
      case 'notifications':
        return <NotificationsTab tenant={tenant} />;
      default:
        return <SummaryTab tenant={tenant} />;
    }
  };

  return (
    <div className="space-y-6">
      <TenantTabs />
      {renderTabContent()}
    </div>
  );
}
