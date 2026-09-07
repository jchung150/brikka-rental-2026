'use client';

import { SimpleTabs } from '@repo/design-system/components/ui/simple-tabs';
import { useLandlordDetail } from '../context';

type TabType = 'summary' | 'buildings' | 'requests' | 'documents';

const tabs = [
  { id: 'summary' as const, label: '요약' },
  { id: 'buildings' as const, label: '건물' },
  { id: 'requests' as const, label: '요청' },
  { id: 'documents' as const, label: '문서' },
];

export function LandlordTabs() {
  const { activeTab, setActiveTab } = useLandlordDetail();

  return (
    <SimpleTabs
      tab={activeTab}
      setTab={(tab) => setActiveTab(tab as TabType)}
      tabs={tabs}
    />
  );
}
