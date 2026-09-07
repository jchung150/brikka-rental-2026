import type { LeaseDetail } from '@/@actions/lease/getLeaseDetail';
import { formatters } from '@repo/common/formatters';

interface LeaseDetailHeaderProps {
  lease: LeaseDetail;
}

export function LeaseDetailHeader({ lease }: LeaseDetailHeaderProps) {
  const leaseName = formatters.leaseUniqueName(
    lease.Unit?.Building?.name || '',
    lease.Unit?.unitNumber || '',
    lease.LeaseTenants[0]?.Tenant?.name || ''
  );
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="font-bold text-2xl text-gray-900">{leaseName}</h1>
      </div>
    </div>
  );
}
