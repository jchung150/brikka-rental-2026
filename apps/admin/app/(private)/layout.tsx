import { AdminSidebar } from '@/components/admin-sidebar';
import { SearchProvider } from '@/context/search-context';
import {
  SidebarInset,
  SidebarProvider,
} from '@repo/design-system/components/ui/sidebar';
import type { ReactNode } from 'react';
import AdminBasicLayout from './_components/layout';

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SearchProvider>
      <SidebarProvider>
        <AdminSidebar variant="sidebar" />
        <SidebarInset>
          <AdminBasicLayout>{children}</AdminBasicLayout>
        </SidebarInset>
      </SidebarProvider>
    </SearchProvider>
  );
}
