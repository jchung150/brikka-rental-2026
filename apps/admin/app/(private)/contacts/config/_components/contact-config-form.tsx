'use client';

import { updateContactConfig } from '@/@actions/contacts/updateContactConfig';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { Clock } from 'lucide-react';
import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'sonner';

interface ContactConfigFormProps {
  initialConfig: { id: bigint; start: string; end: string } | null;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? '저장 중...' : '저장'}
    </Button>
  );
}

export function ContactConfigForm({ initialConfig }: ContactConfigFormProps) {
  const [state, formAction] = useActionState(updateContactConfig, null);

  // 성공/실패 메시지 처리
  useEffect(() => {
    if (state?.ok === false) {
      toast.error(state.message);
    } else if (state?.ok === true) {
      toast.success('설정이 성공적으로 저장되었습니다.');
    }
  }, [state]);

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          투어 운영 시간 설정
        </CardTitle>
        <CardDescription>
          투어 예약이 가능한 시간대를 설정합니다. (HH:mm 형식)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start">시작 시간</Label>
              <Input
                id="start"
                name="start"
                type="time"
                defaultValue={initialConfig?.start || '10:00'}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">종료 시간</Label>
              <Input
                id="end"
                name="end"
                type="time"
                defaultValue={initialConfig?.end || '20:00'}
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <SubmitButton />
          </div>
        </form>

        {initialConfig && (
          <div className="mt-4 rounded-md bg-muted p-3">
            <p className="text-muted-foreground text-sm">
              현재 설정: {initialConfig.start} - {initialConfig.end}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
