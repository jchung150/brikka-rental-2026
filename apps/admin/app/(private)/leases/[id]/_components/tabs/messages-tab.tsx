'use client';

import type { LeaseDetail } from '@/@actions/lease/getLeaseDetail';
import type { LeaseMessage } from '@/@actions/lease/getLeaseMessages';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@repo/design-system/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { MessageDetailDialog } from './message-detail-dialog';
import { createMessagesColumns } from './messages-columns';
import { SendMessageDialog } from './send-message-dialog';

interface MessagesTabProps {
  lease: LeaseDetail;
}

// 임시 데이터 (실제로는 Server Action에서 조회)
const mockMessages: LeaseMessage[] = [
  {
    id: '1',
    sentAt: '2025-05-29T10:30:00Z',
    channel: 'EMAIL',
    title: '제목',
    recipient: '전체',
    status: 'SUCCESS',
    sendMethod: 'AUTOMATIC',
    sender: '시스템',
    content: '이메일 메시지 내용입니다.',
  },
  {
    id: '2',
    sentAt: '2025-05-29T10:30:00Z',
    channel: 'ALIMTALK',
    title: '제목',
    recipient: '전체',
    status: 'FAILED',
    sendMethod: 'MANUAL',
    sender: '관리자',
    content: '알림톡 메시지 내용입니다.',
  },
  {
    id: '3',
    sentAt: '2025-05-29T10:30:00Z',
    channel: 'ALIMTALK',
    title: '제목',
    recipient: '브리카 A동 5층',
    status: 'SUCCESS',
    sendMethod: 'AUTOMATIC',
    sender: '시스템',
    content: '알림톡 메시지 내용입니다.',
  },
  {
    id: '4',
    sentAt: '2025-05-29T10:30:00Z',
    channel: 'EMAIL',
    title: '제목',
    recipient: '브리카 A동 5층',
    status: 'FAILED',
    sendMethod: 'MANUAL',
    sender: '관리자',
    content: '이메일 메시지 내용입니다.',
  },
  {
    id: '5',
    sentAt: '2025-05-29T10:30:00Z',
    channel: 'ALIMTALK',
    title: '제목',
    recipient: '전체',
    status: 'SUCCESS',
    sendMethod: 'AUTOMATIC',
    sender: '시스템',
    content: '알림톡 메시지 내용입니다.',
  },
];

export function MessagesTab({ lease: _lease }: MessagesTabProps) {
  const [messages, setMessages] = useState<LeaseMessage[]>(mockMessages);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<LeaseMessage | null>(
    null
  );

  const handleSendMessage = (newMessage: Omit<LeaseMessage, 'id'>) => {
    const message: LeaseMessage = {
      ...newMessage,
      id: Date.now().toString(),
    };
    setMessages([message, ...messages]);
    setIsSendDialogOpen(false);
  };

  const handleViewDetails = (message: LeaseMessage) => {
    setSelectedMessage(message);
  };

  const handleResend = (message: LeaseMessage) => {
    // 실제로는 재발송 로직 구현
    console.log('재발송:', message.title);
  };

  const columns = createMessagesColumns({
    onViewDetails: handleViewDetails,
    onResend: handleResend,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">일반 메시지 이력</h2>
        <Button onClick={() => setIsSendDialogOpen(true)} variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          수동 발송
        </Button>
      </div>

      <div className="rounded-md border bg-blue-50 p-4">
        <p className="text-blue-800 text-sm">
          청구 알림, 시스템 자동 메시지 등은 이력에서 제외됩니다.
        </p>
      </div>

      <DataTable columns={columns} data={messages} pageSize={10} />

      <SendMessageDialog
        open={isSendDialogOpen}
        onOpenChange={setIsSendDialogOpen}
        onSendMessage={handleSendMessage}
      />

      <MessageDetailDialog
        open={!!selectedMessage}
        onOpenChange={(open) => !open && setSelectedMessage(null)}
        message={selectedMessage}
      />
    </div>
  );
}
