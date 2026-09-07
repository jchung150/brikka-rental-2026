'use client';

import { Header } from '@/components/header';
import { Main } from '@/components/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Search } from '@/components/search';
import { useSession } from 'next-auth/react';
import { DynamicBreadcrumb } from './breadcrumb';

export default function AdminBasicLayout({
  children,
}: { children: React.ReactNode }) {
  const session = useSession();
  const user = session.data?.user;

  return (
    <>
      <Header fixed>
        <DynamicBreadcrumb />
        <div className="ml-auto flex items-center space-x-4">
          <Search />
          <ProfileDropdown />
          <p>{user?.name}</p>
        </div>
      </Header>
      <Main fixed>
        <div className="container mx-auto space-y-6 p-6">{children}</div>
      </Main>
    </>
  );
}
