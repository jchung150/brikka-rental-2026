import { UnpaidBillTable } from './components/unpaid-bill-table';

interface UnpaidBillsPageProps {
  searchParams: Promise<{
    buildingId?: string;
    leaseStatus?: 'PREPARING' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED';
    billStatus?: 'UNPAID' | 'OVERDUE';
  }>;
}

export default async function UnpaidBillsPage({
  searchParams,
}: UnpaidBillsPageProps) {
  const params = await searchParams;
  return <UnpaidBillTable initialFilters={params} />;
}
