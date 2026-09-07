import { listTenants } from '@/@actions/tenants/listTenants';
import { TenantTable } from './components/tenant-table';

export default async function TenantsPage() {
  // 입주자 목록 조회
  const result = await listTenants();

  if (!result.ok) {
    return (
      <div>입주자 목록을 불러오는 중 오류가 발생했습니다: {result.message}</div>
    );
  }

  return <TenantTable tenants={result.data} />;
}
