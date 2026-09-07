import { BillingScheduleTable } from './components/billing-schedule-table';

interface BillingSchedulesPageProps {
  searchParams: Promise<{
    buildingId?: string;
    status?: 'PREPARING' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED';
    itemName?: string;
    dueDateStart?: string;
    dueDateEnd?: string;
  }>;
}

export default async function BillingSchedulesPage({
  searchParams,
}: BillingSchedulesPageProps) {
  const params = await searchParams;
  return <BillingScheduleTable initialFilters={params} />;
}
