'use client';

import { createDocument } from '@/@actions/documents/createDocument';
import { uploadFile } from '@/lib/utils';
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
import { useQueryClient } from '@tanstack/react-query';
import { Upload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface UploadDocumentDialogProps {
  leaseId?: number;
  buildingId?: number;
  unitId?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const documentCategories = [
  '계약서',
  '신분증',
  '보증금 관련',
  '청구 납부 관련',
  '요청 수리 내역',
  '기타',
];

export function UploadDocumentDialog({
  open,
  onOpenChange,
  leaseId,
  buildingId,
  unitId,
}: UploadDocumentDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    file: null as File | null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({
        ...formData,
        file,
        title: file.name,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.file || !formData.type) return;

    setIsLoading(true);

    try {
      const result = await uploadFile(formData.file);
      if (!result) {
        toast.error('파일 업로드 중 오류가 발생했습니다.');
        return;
      }

      await createDocument({
        leaseId: leaseId ?? undefined,
        buildingId: buildingId ?? undefined,
        unitId: unitId ?? undefined,
        fileId: result.id,
        category: '계약서',
        type: formData.type,
        title: formData.title,
      });
      setFormData({
        title: '',
        type: '',
        file: null,
      });
      queryClient.clear();
      onOpenChange(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('파일 업로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData({
        title: '',
        type: '',
        file: null,
      });
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>파일 업로드</DialogTitle>
          <DialogDescription>
            계약과 관련된 문서를 업로드하세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">파일 선택 *</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                required
                className="flex-1"
              />
              <Upload className="h-4 w-4 text-gray-500" />
            </div>
            <p className="text-gray-500 text-xs">
              PDF, JPG, PNG, DOC, DOCX 파일만 업로드 가능합니다.
            </p>
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
              placeholder="문서 제목을 입력하세요"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">카테고리 *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="카테고리를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {documentCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
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
            <Button
              type="submit"
              disabled={!formData.file || !formData.type || isLoading}
            >
              {isLoading ? '업로드 중...' : '업로드'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
