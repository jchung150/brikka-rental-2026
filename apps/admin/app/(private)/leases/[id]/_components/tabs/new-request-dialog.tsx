'use client';

import { createRequest } from '@/@actions/requests/createRequest';
import { UnitPlaceholder } from '@/app/(private)/unit-placeholder';
import { Strings } from '@repo/common/strings';
import {
  RequestSource,
  type RequestStatus,
  type RequestType,
} from '@repo/database/generated/client';
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
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

interface NewRequestDialogProps {
  leaseId: number;
  unitId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function NewRequestDialog({
  leaseId,
  unitId,
  open,
  onOpenChange,
}: NewRequestDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    source: '',
    requestType: 'INQUIRY',
    status: 'PENDING',
  });
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createRequest({
        unitId,
        details: formData.description,
        title: formData.title,
        requestType: formData.requestType as RequestType,
        status: formData.status as RequestStatus,
        requestSource: formData.source as RequestSource,
        leaseId,
      });
      queryClient.clear();
      onOpenChange(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('요청 등록 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData({
        title: '',
        description: '',
        source: '입주자 요청',
        requestType: 'INQUIRY',
        status: 'PENDING',
      });
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>신규 요청 등록</DialogTitle>
          <DialogDescription>새로운 요청을 등록하세요.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="source">출처</Label>
            <Select
              value={formData.source || ''}
              onValueChange={(value) =>
                setFormData({ ...formData, source: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="출처를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(RequestSource).map((source) => (
                  <SelectItem key={source} value={source}>
                    {Strings.requestSource[source]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requestType">요청 유형</Label>
            <Select
              value={formData.requestType || ''}
              onValueChange={(value) =>
                setFormData({ ...formData, requestType: value })
              }
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
          <div className="space-y-2">
            <Label htmlFor="status">처리 상태</Label>
            <Select
              value={formData.status || ''}
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
          <div className="space-y-2">
            <Label htmlFor="title">요청 제목</Label>
            <Input
              id="title"
              value={formData.title || ''}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="요청 제목을 입력하세요"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">요청 내용</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="요청 내용을 상세히 입력하세요"
              rows={4}
            />
          </div>

          <UnitPlaceholder id={unitId} />

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
              {isLoading ? '등록 중...' : '등록'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
