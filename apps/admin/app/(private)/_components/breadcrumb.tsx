'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@repo/design-system/components/ui/breadcrumb';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// 경로별 한국어 라벨 매핑
const pathLabels: Record<string, string> = {
  '/': '홈',
  '/dashboard': '대시보드',
  '/users': '사용자 관리',
  '/buildings': '건물 관리',
  '/leases': '임대 관리',
  '/contracts': '계약 관리',
  '/contract': '계약',
  '/billing': '청구 관리',
  '/notices': '공지사항',
  '/notifications': '알림',
  '/documents': '문서 관리',
  '/reports': '보고서',
  '/requests': '요청 관리',
  '/settlements': '정산 관리',
  '/delegation': '위임 관리',
  '/history': '이력 관리',
  '/portal': '포털',
  '/profile': '프로필',
  '/users/admins': '관리자 관리',
  '/users/tenants': '입주자 관리',
  '/users/landlords': '임대인 관리',
};

export function DynamicBreadcrumb() {
  const pathname = usePathname();

  // 경로를 세그먼트로 분할
  const pathSegments = pathname.split('/').filter(Boolean);

  // breadcrumb 아이템 생성
  const breadcrumbItems = pathSegments.map((segment, index) => {
    const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
    const label = pathLabels[path] || segment;

    // 마지막 아이템인지 확인
    const isLast = index === pathSegments.length - 1;

    return {
      path,
      label,
      isLast,
    };
  });

  // 홈이 없으면 홈을 추가
  if (pathname !== '/') {
    breadcrumbItems.unshift({
      path: '/',
      label: '홈',
      isLast: false,
    });
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <div key={item.path} className="flex items-center">
            <BreadcrumbItem>
              {item.isLast ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.path}>{item.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!item.isLast && <BreadcrumbSeparator />}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
