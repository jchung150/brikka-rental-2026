'use client';

import { getLeaseDetail } from '@/@actions/lease/getLeaseDetail';
import { QueryKeys } from '@/@hooks/query-keys';
import { SimpleSpinner } from '@/components/spinner';
import { useQuery } from '@tanstack/react-query';
import { LeaseDetailProvider } from './_components/context';
import { LeaseDetailHeader } from './_components/lease-detail-header';
import { LeaseDetailTabs } from './_components/lease-detail-tabs';

export default function LeaseDetailBody({ id }: { id: number }) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QueryKeys.Lease.Detail(id),
    queryFn: () => getLeaseDetail(id),
  });

  if (!data) {
    return <SimpleSpinner />;
  }

  if (!data.ok) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-2xl text-red-600">오류 발생</h1>
          <p className="text-gray-600">{data.message}</p>
        </div>
      </div>
    );
  }

  const lease = data.data;

  return (
    <LeaseDetailProvider detail={lease}>
      <div className="space-y-6">
        <LeaseDetailHeader lease={lease} />
        <LeaseDetailTabs lease={lease} />
      </div>
    </LeaseDetailProvider>
  );
}
