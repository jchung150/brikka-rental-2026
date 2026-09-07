import { useLeaseDetail } from '../context';
import { AdditionalInfoSection } from './additional-info-section';
import { BasicInfoSection } from './basic-info-section';
import { ContractInfoSection } from './contract-info-section';
import { SummarySection } from './summary-section';

export function SummaryTab() {
  const { detail: lease } = useLeaseDetail();
  return (
    <div className="space-y-6">
      <SummarySection lease={lease} />
      <BasicInfoSection lease={lease} />
      <ContractInfoSection lease={lease} />
      <AdditionalInfoSection lease={lease} />
    </div>
  );
}
