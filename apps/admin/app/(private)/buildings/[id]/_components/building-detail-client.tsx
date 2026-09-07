'use client';

import { CardSkeleton } from '@repo/design-system/components/skeleton';
import { SimpleTabs } from '@repo/design-system/components/ui/simple-tabs';
import { useState } from 'react';
import { useBuildingDetailContext } from '../context';
import { DocumentsTab } from './tabs/documents';
import { RequestsTab } from './tabs/requests';
import { Summary } from './tabs/summary';
import { UnitsTab } from './tabs/units';

const tabs = [
  { id: 'summary', label: '요약' },
  { id: 'units', label: '유닛' },
  { id: 'requests', label: '요청' },
  { id: 'documents', label: '문서' },
];

export function BuildingDetailClient() {
  const { building } = useBuildingDetailContext();
  const [tab, setTab] = useState('summary');

  const renderTabContent = () => {
    if (building === null) {
      return <CardSkeleton variant="detailed" />;
    }

    switch (tab) {
      case 'summary':
        return <Summary building={building} />;
      case 'units':
        return <UnitsTab buildingId={Number(building.id)} />;
      case 'requests':
        return <RequestsTab buildingId={Number(building.id)} />;
      case 'documents':
        return <DocumentsTab buildingId={Number(building.id)} />;
      default:
        return null;
    }
  };

  return (
    <>
      <SimpleTabs tab={tab} setTab={setTab} tabs={tabs} />
      {renderTabContent()}
    </>
  );
}
