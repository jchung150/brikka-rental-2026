'use client';

import type { BuildingDto } from '@/@data/building';
import { Namespace } from '@/@hooks/query-keys';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/components/ui/dialog';
import { useQueryClient } from '@tanstack/react-query';
import { EditIcon, PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { BuildingForm } from './building-form';

interface BuildingDialogProps {
  mode: 'create' | 'edit';
  building?: BuildingDto;
  onSuccess?: () => void;
}

export default function BuildingDialog({
  mode,
  building,
  onSuccess,
}: BuildingDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const isEdit = mode === 'edit';
  const title = isEdit ? '건물 정보 수정' : '신규 건물 등록';
  const defaultTrigger = isEdit ? (
    <Button variant="outline" size="sm">
      <EditIcon className="h-4 w-4" />
      수정
    </Button>
  ) : (
    <Button variant="outline">
      <PlusIcon className="h-4 w-4" />
      신규 건물 등록
    </Button>
  );

  const handleSuccess = () => {
    setOpen(false);
    queryClient.invalidateQueries({
      queryKey: [Namespace.Building],
      exact: false,
    });
    onSuccess?.();
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{defaultTrigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <BuildingForm
          building={building}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
