'use client';

import { SimpleTabs } from '@repo/design-system/components/ui/simple-tabs';
import { useTenantDetail } from '../context';

type TabType = 'summary' | 'requests' | 'documents' | 'notifications';

const tabs = [
  { id: 'summary' as const, label: '요약' },
  { id: 'requests' as const, label: '요청' },
  { id: 'documents' as const, label: '문서보관' },
  { id: 'notifications' as const, label: '알림설정' },
];

export function TenantTabs() {
  const { activeTab, setActiveTab } = useTenantDetail();

  return (
    <SimpleTabs
      tab={activeTab}
      setTab={(tab) => setActiveTab(tab as TabType)}
      tabs={tabs}
    />
  );
}
