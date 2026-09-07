'use client';

import type { SidebarData } from '@/components/data/types';
import {
  BarChart3,
  Bell,
  Building2,
  ClipboardList,
  CreditCard,
  Edit3,
  FileText,
  FolderOpen,
  History,
  Home,
  LayoutDashboardIcon,
  ListTodo,
  MessageSquare,
  User,
  Users,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useMemo } from 'react';

export function useSidebarData() {
  const { data } = useSession();
  const role = data?.user?.role;

  return useMemo(() => {
    const user = {
      name: data?.user?.name ?? '',
      email: data?.user?.email ?? '',
      avatar: data?.user?.image ?? '',
    };
    return getSidebarData(user, role);
  }, [data?.user, role]);
}

export function getSidebarData(
  user: {
    name: string;
    email: string;
    avatar: string;
  },
  role?: string
): SidebarData {
  // role에 따라 다른 메뉴 구성
  switch (role) {
    case 'ADMIN': // 슈퍼관리자
      return getSuperAdminSidebar(user);
    case 'FACILITY_MANAGER': // 시설 관리자
    case 'GENERAL_MANAGER': // 일반 관리자
      return getAdminSidebar(user);
    case 'LANDLORD': // 임대인
      return getLandlordSidebar(user);
    case 'TENANT': // 임차인(입주자)
      return getTenantSidebar(user);
    default:
      return getDefaultSidebar(user);
  }
}

function getSuperAdminSidebar(user: {
  name: string;
  email: string;
  avatar: string;
}): SidebarData {
  return {
    user,
    navGroups: [
      {
        title: '메인',
        items: [
          {
            title: '대시보드',
            href: '/dashboard',
            icon: LayoutDashboardIcon,
          },
        ],
      },
      {
        title: '임대 관리',
        items: [
          {
            title: '임대 계약',
            icon: FileText,
            items: [
              { title: '계약 목록', href: '/leases' },
              { title: '신규 계약 등록', href: '/leases/new' },
            ],
          },
          {
            title: '청구•수납',
            icon: CreditCard,
            items: [
              { title: '미납 내역', href: '/billing/unpaid' },
              { title: '청구 내역', href: '/billing/bills' },
              { title: '수납 내역', href: '/billing/payments' },
            ],
          },
        ],
      },
      {
        title: '시스템 관리',
        items: [
          {
            title: '요청 목록',
            href: '/requests',
            icon: ListTodo,
          },
          {
            title: '건물 목록',
            href: '/buildings',
            icon: Building2,
          },
          {
            title: '사용자 및 계정',
            icon: Users,
            items: [
              { title: '내 프로필', href: '/profile' },
              { title: '관리자 목록', href: '/users/admins' },
              // { title: '매니저 목록', href: '/users/managers' },
              { title: '입주자 목록', href: '/users/tenants' },
              { title: '임대인 목록', href: '/users/landlords' },
            ],
          },
          {
            title: '알림•공지',
            icon: Bell,
            items: [
              { title: '알림 발송 이력', href: '/notifications/history' },
              { title: '알림 직접 발송', href: '/notifications/send' },
              { title: '자동 발송 설정', href: '/notifications/settings' },
            ],
          },
          {
            title: '문서 목록',
            href: '/documents',
            icon: FolderOpen,
          },
          {
            title: '변경 이력',
            href: '/history',
            icon: History,
          },
          {
            title: '홈페이지 관리',
            href: '/homepage',
            icon: Home,
          },
          {
            title: '문의 관리',
            icon: MessageSquare,
            items: [
              { title: '문의 목록', href: '/contacts' },
              { title: '문의 가능 시간 설정', href: '/contacts/config' },
            ],
          },
        ],
      },
    ],
  };
}

function getAdminSidebar(user: {
  name: string;
  email: string;
  avatar: string;
}): SidebarData {
  return {
    user,
    navGroups: [
      {
        title: '메인',
        items: [
          {
            title: '대시보드',
            href: '/dashboard',
            icon: LayoutDashboardIcon,
          },
        ],
      },
      {
        title: '임대 관리',
        items: [
          {
            title: '임대 계약',
            icon: FileText,
            items: [
              { title: '계약 목록', href: '/leases' },
              { title: '신규 계약 등록', href: '/leases/new' },
            ],
          },
          {
            title: '청구•수납',
            icon: CreditCard,
            items: [
              { title: '미납 내역', href: '/billing/unpaid' },
              { title: '청구 내역', href: '/billing/bills' },
              { title: '수납 내역', href: '/billing/payments' },
            ],
          },
        ],
      },
      {
        title: '시스템 관리',
        items: [
          {
            title: '요청 목록',
            href: '/requests',
            icon: ListTodo,
          },
          {
            title: '건물 목록',
            href: '/buildings',
            icon: Building2,
          },
          {
            title: '사용자 및 계정',
            icon: Users,
            items: [
              { title: '내 프로필', href: '/profile' },
              { title: '입주자 목록', href: '/users/tenants' },
              { title: '임대인 목록', href: '/users/landlords' },
            ],
          },
          {
            title: '알림•공지',
            icon: Bell,
            items: [
              { title: '알림 발송 이력', href: '/notifications/history' },
              { title: '알림 직접 발송', href: '/notifications/send' },
              { title: '자동 발송 설정', href: '/notifications/settings' },
            ],
          },
          {
            title: '문서 목록',
            href: '/documents',
            icon: FolderOpen,
          },
          {
            title: '변경 이력',
            href: '/history',
            icon: History,
          },
          {
            title: '문의 관리',
            icon: MessageSquare,
            items: [
              { title: '문의 목록', href: '/contacts' },
              { title: '문의 가능 시간 설정', href: '/contacts/config' },
            ],
          },
        ],
      },
    ],
  };
}

function getLandlordSidebar(user: {
  name: string;
  email: string;
  avatar: string;
}): SidebarData {
  return {
    user,
    navGroups: [
      {
        title: '임대인 포털',
        items: [
          {
            title: '임대인 포털',
            href: '/portal',
            icon: Home,
          },
          {
            title: '대시보드',
            href: '/dashboard',
            icon: LayoutDashboardIcon,
          },
          {
            title: '건물 및 유닛정보',
            href: '/buildings',
            icon: Building2,
          },
          {
            title: '위임 계약서',
            href: '/delegation',
            icon: FileText,
          },
          {
            title: '계약 현황',
            href: '/contracts',
            icon: ClipboardList,
          },
          {
            title: '공지 목록',
            href: '/notices',
            icon: Bell,
          },
          {
            title: '보고서',
            href: '/reports',
            icon: BarChart3,
          },
        ],
      },
    ],
  };
}

function getTenantSidebar(user: {
  name: string;
  email: string;
  avatar: string;
}): SidebarData {
  return {
    user,
    navGroups: [
      {
        title: '입주자 포털',
        items: [
          {
            title: '입주자 포털',
            href: '/portal',
            icon: Home,
          },
          {
            title: '계약정보',
            href: '/contract',
            icon: FileText,
          },
          {
            title: '정산내역 통합보기',
            href: '/settlements',
            icon: CreditCard,
          },
          {
            title: '요청',
            href: '/requests',
            icon: MessageSquare,
          },
          {
            title: '알림',
            href: '/notifications',
            icon: Bell,
          },
          {
            title: '공지 목록',
            href: '/notices',
            icon: ListTodo,
          },
          {
            title: '정보수정',
            href: '/profile/edit',
            icon: Edit3,
          },
        ],
      },
    ],
  };
}

function getDefaultSidebar(user: {
  name: string;
  email: string;
  avatar: string;
}): SidebarData {
  return {
    user,
    navGroups: [
      {
        title: '일반',
        items: [
          {
            title: '홈',
            href: '/',
            icon: LayoutDashboardIcon,
          },
          {
            title: '프로필',
            href: '/profile',
            icon: User,
          },
        ],
      },
    ],
  };
}
