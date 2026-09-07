'use client';
import { Strings } from '@repo/common/strings';
import type { UserRole } from '@repo/database';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { UserForm } from './create-user-form';

interface CreateUserDialogProps {
  type: UserRole;
}

export function CreateUserDialog({ type }: CreateUserDialogProps) {
  const [open, setOpen] = useState(false);

  const title = `신규 ${Strings.userRole[type]} 등록`;

  const handleSuccess = () => {
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          {title}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <UserForm
          type={type}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
