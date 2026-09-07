'use client';

import { updateContact } from '@/@actions/contacts/updateContact';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import { Label } from '@repo/design-system/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  ArrowLeft,
  Calendar,
  Mail,
  MessageSquare,
  Phone,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

interface Contact {
  id: bigint;
  name: string;
  email: string | null;
  phoneNumber: string | null;
  howDidYouFind: string | null;
  memo: string | null;
  reservationTime: Date;
  status: string;
  adminMemo: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ContactDetailProps {
  contact: Contact;
}

const statusLabels = {
  PENDING: { label: '대기중', variant: 'secondary' as const },
  CONFIRMED: { label: '확정', variant: 'default' as const },
  COMPLETED: { label: '완료', variant: 'success' as const },
  CANCELLED: { label: '취소', variant: 'destructive' as const },
};

function SubmitButton({ isPending }: { isPending: boolean }) {
  return (
    <Button type="submit" disabled={isPending}>
      {isPending ? '저장 중...' : '저장'}
    </Button>
  );
}

export function ContactDetail({ contact }: ContactDetailProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [status, setStatus] = useState(contact.status);
  const [adminMemo, setAdminMemo] = useState(contact.adminMemo || '');

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        const result = await updateContact({
          id: contact.id,
          status: status as 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED',
          adminMemo: adminMemo || null,
        });

        if (result.ok) {
          toast.success('문의 정보가 업데이트되었습니다.');
          router.refresh();
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error('업데이트 중 오류가 발생했습니다.');
      }
    });
  };

  const statusInfo =
    statusLabels[contact.status as keyof typeof statusLabels] ||
    statusLabels.PENDING;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/contacts">
            <ArrowLeft className="mr-1 h-4 w-4" />
            목록으로
          </Link>
        </Button>
        <div>
          <h1 className="font-bold text-2xl">문의 상세</h1>
          <p className="text-muted-foreground">
            문의 ID: {contact.id.toString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 기본 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              기본 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="font-medium text-sm">예약자 성함</Label>
              <div className="mt-1 rounded-md bg-muted p-2">{contact.name}</div>
            </div>

            <div>
              <Label className="font-medium text-sm">이메일</Label>
              <div className="mt-1 flex items-center gap-2 rounded-md bg-muted p-2">
                <Mail className="h-4 w-4" />
                {contact.email || '-'}
              </div>
            </div>

            <div>
              <Label className="font-medium text-sm">전화번호</Label>
              <div className="mt-1 flex items-center gap-2 rounded-md bg-muted p-2">
                <Phone className="h-4 w-4" />
                {contact.phoneNumber || '-'}
              </div>
            </div>

            <div>
              <Label className="font-medium text-sm">알게된 경로</Label>
              <div className="mt-1 rounded-md bg-muted p-2">
                {contact.howDidYouFind || '-'}
              </div>
            </div>

            <div>
              <Label className="font-medium text-sm">메모</Label>
              <div className="mt-1 min-h-[60px] rounded-md bg-muted p-2">
                {contact.memo || '-'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 예약 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              예약 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="font-medium text-sm">예약 시간</Label>
              <div className="mt-1 flex items-center gap-2 rounded-md bg-muted p-2">
                <Calendar className="h-4 w-4" />
                {format(
                  new Date(contact.reservationTime),
                  'yyyy년 MM월 dd일 HH:mm',
                  { locale: ko }
                )}
              </div>
            </div>

            <div>
              <Label className="font-medium text-sm">현재 상태</Label>
              <div className="mt-1">
                <Badge variant={statusInfo.variant} className="text-sm">
                  {statusInfo.label}
                </Badge>
              </div>
            </div>

            <div>
              <Label className="font-medium text-sm">등록일</Label>
              <div className="mt-1 rounded-md bg-muted p-2">
                {format(new Date(contact.createdAt), 'yyyy년 MM월 dd일 HH:mm', {
                  locale: ko,
                })}
              </div>
            </div>

            <div>
              <Label className="font-medium text-sm">최종 수정일</Label>
              <div className="mt-1 rounded-md bg-muted p-2">
                {format(new Date(contact.updatedAt), 'yyyy년 MM월 dd일 HH:mm', {
                  locale: ko,
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 관리자 관리 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            관리자 관리
          </CardTitle>
          <CardDescription>
            문의 상태와 관리자 메모를 관리합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="status">상태 변경</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">대기중</SelectItem>
                    <SelectItem value="CONFIRMED">확정</SelectItem>
                    <SelectItem value="COMPLETED">완료</SelectItem>
                    <SelectItem value="CANCELLED">취소</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminMemo">관리자 메모</Label>
                <Textarea
                  id="adminMemo"
                  placeholder="관리자 메모를 입력하세요..."
                  value={adminMemo}
                  onChange={(e) => setAdminMemo(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <SubmitButton isPending={isPending} />
            </div>
          </form>

          {contact.adminMemo && (
            <div className="mt-4 rounded-md bg-muted p-3">
              <Label className="font-medium text-sm">기존 관리자 메모</Label>
              <div className="mt-1 text-sm">{contact.adminMemo}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
