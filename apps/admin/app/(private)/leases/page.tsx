import { LeaseTable } from './components/lease-table';

interface LeasesPageProps {
  searchParams: Promise<{
    buildingId?: string;
    status?: 'PREPARING' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED';
    remainingDaysFilter?: 'expired' | 'urgent' | 'upcoming' | 'normal';
    renewalNoticeFilter?: 'overdue' | 'urgent' | 'normal';
  }>;
}

export default async function LeasesPage({ searchParams }: LeasesPageProps) {
  const params = await searchParams;
  return <LeaseTable initialFilters={params} />;
}
