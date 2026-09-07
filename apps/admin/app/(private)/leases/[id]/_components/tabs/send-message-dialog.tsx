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
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { useState } from 'react';

interface SendMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSendMessage: (message: Omit<LeaseMessage, 'id'>) => void;
}

const channelOptions = [
  { value: 'EMAIL', label: '이메일' },
  { value: 'SMS', label: 'SMS' },
  { value: 'ALIMTALK', label: '알림톡' },
];

const recipientOptions = [
  { value: 'ALL', label: '전체' },
  { value: 'BUILDING', label: '브리카 A동 5층' },
  { value: 'TENANT', label: '입주자만' },
];

export function SendMessageDialog({
  open,
  onOpenChange,
  onSendMessage,
}: SendMessageDialogProps) {
  const [formData, setFormData] = useState({
    channel: 'EMAIL',
    title: '',
    content: '',
    recipient: 'ALL',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const message: Omit<LeaseMessage, 'id'> = {
        sentAt: new Date().toISOString(),
        channel: formData.channel as LeaseMessage['channel'],
        title: formData.title,
        recipient:
          formData.recipient === 'ALL'
            ? '전체'
            : formData.recipient === 'BUILDING'
              ? '브리카 A동 5층'
              : '입주자만',
        status: 'SUCCESS', // 임시로 성공으로 설정
        sendMethod: 'MANUAL',
        sender: '관리자',
        content: formData.content,
      };

      await onSendMessage(message);
      setFormData({
        channel: 'EMAIL',
        title: '',
        content: '',
        recipient: 'ALL',
      });
      onOpenChange(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('메시지 발송 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData({
        channel: 'EMAIL',
        title: '',
        content: '',
        recipient: 'ALL',
      });
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>수동 메시지 발송</DialogTitle>
          <DialogDescription>메시지를 수동으로 발송하세요.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="channel">발송 채널 *</Label>
              <Select
                value={formData.channel}
                onValueChange={(value) =>
                  setFormData({ ...formData, channel: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="채널을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {channelOptions.map((channel) => (
                    <SelectItem key={channel.value} value={channel.value}>
                      {channel.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient">수신자 *</Label>
              <Select
                value={formData.recipient}
                onValueChange={(value) =>
                  setFormData({ ...formData, recipient: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="수신자를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {recipientOptions.map((recipient) => (
                    <SelectItem key={recipient.value} value={recipient.value}>
                      {recipient.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              placeholder="메시지 제목을 입력하세요"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">내용 *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              required
              placeholder="메시지 내용을 입력하세요"
              rows={6}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '발송 중...' : '발송'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
