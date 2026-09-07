'use client';

import type { LeaseDetail } from '@/@actions/lease/getLeaseDetail';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/design-system/components/ui/tabs';
import { BillingItemsTab } from './tabs/billing-items-tab';
import { DocumentsTab } from './tabs/documents-tab';
import { LedgerTab } from './tabs/ledger-tab';
import { MessagesTab } from './tabs/messages-tab';
import { RequestsTab } from './tabs/requests-tab';
import { SummaryTab } from './tabs/summary-tab';
import { TenantTab } from './tabs/tenant-tab';

interface LeaseDetailTabsProps {
  lease: LeaseDetail;
}

const tabs = [
  { value: 'summary', label: '요약' },
  { value: 'tenant', label: '입주자 정보' },
  { value: 'billing', label: '청구항목 정보' },
  { value: 'ledger', label: '원장 정보' },
  { value: 'documents', label: '문서' },
  { value: 'requests', label: '요청 내역' },
  { value: 'messages', label: '일반 메시지 이력' },
];

export function LeaseDetailTabs({ lease }: LeaseDetailTabsProps) {
  return (
    <Tabs defaultValue="summary" className="w-full">
      <TabsList className="grid w-full grid-cols-7">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="summary" className="mt-6">
        <SummaryTab />
      </TabsContent>

      <TabsContent value="tenant" className="mt-6">
        <TenantTab />
      </TabsContent>

      <TabsContent value="billing" className="mt-6">
        <BillingItemsTab lease={lease} />
      </TabsContent>

      <TabsContent value="ledger" className="mt-6">
        <LedgerTab lease={lease} />
      </TabsContent>

      <TabsContent value="documents" className="mt-6">
        <DocumentsTab lease={lease} />
      </TabsContent>

      <TabsContent value="requests" className="mt-6">
        <RequestsTab lease={lease} />
      </TabsContent>

      <TabsContent value="messages" className="mt-6">
        <MessagesTab lease={lease} />
      </TabsContent>
    </Tabs>
  );
}
