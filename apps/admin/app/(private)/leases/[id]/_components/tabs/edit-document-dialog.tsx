'use client';

import type { DocumentListItem } from '@/@actions/documents/listDocuments';
import { C } from '@repo/common/constant';
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
import { useEffect, useState } from 'react';

interface EditDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: DocumentListItem | null;
  onUpdate: (document: DocumentListItem) => void;
}

export function EditDocumentDialog({
  open,
  onOpenChange,
  document,
  onUpdate,
}: EditDocumentDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (document) {
      setFormData({
        title: document.title || '',
        category: document.category,
      });
    }
  }, [document]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!document) return;

    setIsLoading(true);

    try {
      const updatedDocument: DocumentListItem = {
        ...document,
        ...formData,
      };
      await onUpdate(updatedDocument);
      onOpenChange(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('문서 수정 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && document) {
      setFormData({
        title: document.title || '',
        category: document.category,
      });
    }
    onOpenChange(open);
  };

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>문서 정보 수정</DialogTitle>
          <DialogDescription>문서 정보를 수정하세요.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="카테고리를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {C.ALL_DOC_TYPES.map((category) => (
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '수정 중...' : '수정'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
