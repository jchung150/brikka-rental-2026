'use client';

import type { RequestListItem } from '@/@actions/requests/listRequests';
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
import { useEffect, useState } from 'react';

interface EditRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: RequestListItem | null;
  onUpdate: (request: RequestListItem) => void;
}

const requestTypes = [
  { value: 'COMPLAINT', label: '민원' },
  { value: 'SUGGESTION', label: '제안' },
  { value: 'INQUIRY', label: '문의' },
  { value: 'REPAIR', label: '수선' },
];

const statusOptions = [
  { value: 'PENDING', label: '미분류' },
  { value: 'IN_PROGRESS', label: '처리중' },
  { value: 'COMPLETED', label: '완료' },
  { value: 'CANCELED', label: '보류' },
  { value: 'REJECTED', label: '거부' },
];

export function EditRequestDialog({
  open,
  onOpenChange,
  request,
  onUpdate,
}: EditRequestDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    source: '',
    requestType: 'INQUIRY',
    status: 'PENDING',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (request) {
      setFormData({
        title: request.title ?? '',
        description: request.details ?? '',
        source: request.requestSource ?? '',
        requestType: request.requestType,
        status: request.status,
      });
    }
  }, [request]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!request) return;

    setIsLoading(true);

    try {
      const updatedRequest: RequestListItem = {
        ...request,
        title: formData.title,
        details: formData.description ?? '',
        requestSource: formData.source as RequestListItem['requestSource'],
        requestType: formData.requestType as RequestListItem['requestType'],
        status: formData.status as RequestListItem['status'],
      };

      await onUpdate(updatedRequest);
      onOpenChange(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('요청 수정 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && request) {
      setFormData({
        title: request.title ?? '',
        description: request.details ?? '',
        source: request.requestSource ?? '',
        requestType: request.requestType,
        status: request.status,
      });
    }
    onOpenChange(open);
  };

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>요청 수정</DialogTitle>
          <DialogDescription>요청 정보를 수정하세요.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">요청 제목 *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              placeholder="요청 제목을 입력하세요"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">요청 내용</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="요청 내용을 상세히 입력하세요"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source">출처</Label>
              <Input
                id="source"
                value={formData.source}
                onChange={(e) =>
                  setFormData({ ...formData, source: e.target.value })
                }
                placeholder="출처를 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requestType">요청 유형 *</Label>
              <Select
                value={formData.requestType}
                onValueChange={(value) =>
                  setFormData({ ...formData, requestType: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="요청 유형을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {requestTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">처리 상태</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="처리 상태를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              {isLoading ? '수정 중...' : '수정'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
