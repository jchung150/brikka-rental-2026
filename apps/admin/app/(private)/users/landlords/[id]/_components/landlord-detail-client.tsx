'use client';

import type { LandlordDetail } from '@/@actions/landlords/getLandlordDetail';
import { useLandlordDetail } from '../context';
import { BuildingsTab } from './buildings-tab';
import { DocumentsTab } from './documents-tab';
import { LandlordTabs } from './landlord-tabs';
import { RequestsTab } from './requests-tab';
import { SummaryTab } from './summary-tab';

interface LandlordDetailClientProps {
  landlord: LandlordDetail;
}

export function LandlordDetailClient({ landlord }: LandlordDetailClientProps) {
  const { activeTab } = useLandlordDetail();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return <SummaryTab landlord={landlord} />;
      case 'buildings':
        return <BuildingsTab landlord={landlord} />;
      case 'requests':
        return <RequestsTab landlord={landlord} />;
      case 'documents':
        return <DocumentsTab landlord={landlord} />;
      default:
        return <SummaryTab landlord={landlord} />;
    }
  };

  return (
    <div className="space-y-6">
      <LandlordTabs />
      {renderTabContent()}
    </div>
  );
}
