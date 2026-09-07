'use client';

import type { LeaseMessage } from '@/@actions/lease/getLeaseMessages';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/design-system/components/ui/dialog';
import { Separator } from '@repo/design-system/components/ui/separator';

interface MessageDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: LeaseMessage | null;
}

export function MessageDetailDialog({
  open,
  onOpenChange,
  message,
}: MessageDetailDialogProps) {
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getChannelLabel = (channel: string) => {
    switch (channel) {
      case 'EMAIL':
        return '이메일';
      case 'SMS':
        return 'SMS';
      case 'ALIMTALK':
        return '알림톡';
      case 'PUSH':
        return '푸시';
      default:
        return '알 수 없음';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'text-green-600';
      case 'FAILED':
        return 'text-red-600';
      case 'PENDING':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return '전송성공';
      case 'FAILED':
        return '전송실패';
      case 'PENDING':
        return '전송대기';
      default:
        return '알 수 없음';
    }
  };

  const getSendMethodLabel = (method: string) => {
    switch (method) {
      case 'AUTOMATIC':
        return '자동';
      case 'MANUAL':
        return '수동';
      default:
        return '알 수 없음';
    }
  };

  if (!message) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>메시지 상세 정보</DialogTitle>
          <DialogDescription>
            메시지의 상세 정보를 확인할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-gray-500 text-sm">
                발송일시
              </label>
              <div className="mt-1 text-sm">
                {formatDateTime(message.sentAt)}
              </div>
            </div>
            <div>
              <label className="font-medium text-gray-500 text-sm">채널</label>
              <div className="mt-1 text-sm">
                {getChannelLabel(message.channel)}
              </div>
            </div>
          </div>

          <div>
            <label className="font-medium text-gray-500 text-sm">제목</label>
            <div className="mt-1 font-medium text-sm">{message.title}</div>
          </div>

          <div>
            <label className="font-medium text-gray-500 text-sm">내용</label>
            <div className="mt-1 whitespace-pre-wrap rounded-md border p-3 text-sm">
              {message.content}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-gray-500 text-sm">
                수신자
              </label>
              <div className="mt-1 text-sm">{message.recipient}</div>
            </div>
            <div>
              <label className="font-medium text-gray-500 text-sm">
                발송방식
              </label>
              <div className="mt-1 text-sm">
                {getSendMethodLabel(message.sendMethod)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-gray-500 text-sm">상태</label>
              <div
                className={`mt-1 font-medium text-sm ${getStatusColor(message.status)}`}
              >
                {getStatusLabel(message.status)}
              </div>
            </div>
            <div>
              <label className="font-medium text-gray-500 text-sm">
                발송자
              </label>
              <div className="mt-1 text-sm">{message.sender}</div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
