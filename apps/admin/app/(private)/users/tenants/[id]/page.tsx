import { getTenantDetail } from '@/@actions/tenants/getTenantDetail';
import { notFound } from 'next/navigation';
import { TenantDetailClient } from './_components/tenant-detail-client';
import { TenantDetailProvider } from './context';

interface TenantDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TenantDetailPage({
  params,
}: TenantDetailPageProps) {
  const { id } = await params;
  const result = await getTenantDetail(Number(id));

  if (!result.ok) {
    if (result.code === 'NOT_FOUND') {
      notFound();
    }
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-2xl text-red-600">오류 발생</h1>
          <p className="text-gray-600">{result.message}</p>
        </div>
      </div>
    );
  }

  const tenant = result.data;
  const lease = tenant.LeaseTenants[0].Lease;

  return (
    <div className="container mx-auto space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl">
            {lease
              ? `${lease.Unit.Building.name}-${lease.Unit.name}-${tenant.name}`
              : tenant.name}
          </h1>
          <p className="mt-1 text-gray-600">
            {lease ? lease.Unit.Building.address : tenant.email}
          </p>
        </div>
      </div>

      {/* 클라이언트 컴포넌트로 탭 네비게이션과 컨텐츠 관리 */}
      <TenantDetailProvider tenantId={Number(id)}>
        <TenantDetailClient tenant={tenant} />
      </TenantDetailProvider>
    </div>
  );
}
