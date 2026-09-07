'use client';

import type { UserRole } from '@repo/database';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@repo/design-system/components/ui/avatar';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import { Edit, Lock } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { PasswordChangeDialog } from './password-change-dialog';
import { ProfileEditDialog } from './profile-edit-dialog';

interface ProfilePageClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string | null;
    profileImageUrl: string | null;
    role: string;
  };
}

export function ProfilePageClient({ user }: ProfilePageClientProps) {
  const { data: session } = useSession();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const getRoleInfo = (role?: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return { label: '슈퍼관리자', variant: 'default' as const };
      case 'MANAGER':
        return { label: '매니저', variant: 'secondary' as const };
      case 'LANDLORD':
        return { label: '임대인', variant: 'outline' as const };
      case 'TENANT':
        return { label: '입주자', variant: 'outline' as const };
      default:
        return { label: '사용자', variant: 'outline' as const };
    }
  };

  const roleInfo = getRoleInfo(user.role as UserRole);

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>프로필 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            {/* 프로필 이미지 */}
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={user.profileImageUrl || session?.user?.image || ''}
                alt="프로필 이미지"
              />
              <AvatarFallback className="text-2xl">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>

            {/* 사용자 정보 */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="font-bold text-2xl">{user.name}</h2>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant={roleInfo.variant} className="text-sm">
                    {roleInfo.label}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-muted-foreground text-sm">이메일</span>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">연락처</span>
                  <p className="font-medium">
                    {user.phoneNumber || '연락처 정보 없음'}
                  </p>
                </div>
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={() => setIsPasswordDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Lock className="h-4 w-4" />
                패스워드 변경
              </Button>
              <Button
                onClick={() => setIsEditDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                수정
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 다이얼로그들 */}
      <ProfileEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        user={user}
        onUploadImage={() => {}}
      />
      <PasswordChangeDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      />
    </div>
  );
}
