import { listUsers } from '@/@actions/users/listUsers';
import { UserRole } from '@repo/database';
import { UserTable } from '../components/user-table';

interface UsersPageProps {
  params: Promise<{ slug: string }>;
}

const slugs = ['admins', 'managers', 'tenants', 'landlords'] as const;
export type Slug = (typeof slugs)[number];

const slugToUserRole: Record<Slug, UserRole[]> = {
  admins: [UserRole.ADMIN],
  managers: [UserRole.MANAGER],
  tenants: [UserRole.TENANT],
  landlords: [UserRole.LANDLORD],
} as const;

const slugToType: Record<Slug, 'ADMIN' | 'MANAGER' | 'TENANT' | 'LANDLORD'> = {
  admins: 'ADMIN',
  managers: 'MANAGER',
  tenants: 'TENANT',
  landlords: 'LANDLORD',
} as const;

export default async function UsersPage({ params }: UsersPageProps) {
  const { slug } = await params;

  if (!(slug in slugToUserRole)) {
    return <div>잘못된 페이지입니다.</div>;
  }

  const type = slugToType[slug as keyof typeof slugToType];

  // 사용자 목록 조회
  const result = await listUsers();

  if (!result.ok) {
    return (
      <div>사용자 목록을 불러오는 중 오류가 발생했습니다: {result.message}</div>
    );
  }

  return <UserTable users={result.data} type={type} />;
}
