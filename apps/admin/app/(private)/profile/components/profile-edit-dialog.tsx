'use client';

import { updateProfileImage } from '@/@actions/users/updateProfileImage';
import { updateUserProfile } from '@/@actions/users/updateUserProfile';
import { AwsKeys } from '@/lib/aws-keys';
import { uploadFile } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@repo/design-system/components/ui/avatar';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/design-system/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import { Loader2, Upload, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요'),
  email: z.string().email('올바른 이메일을 입력해주세요'),
  phoneNumber: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadImage: (url: string) => void;
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string | null;
    profileImageUrl?: string | null;
  };
}

export function ProfileEditDialog({
  open,
  onOpenChange,
  user,
}: ProfileEditDialogProps) {
  const { update } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(
    user.profileImageUrl || ''
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
    },
  });

  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true);
    try {
      const fileResult = await uploadFile(file, AwsKeys.of(file), false);
      if (fileResult) {
        setProfileImageUrl(fileResult.fileUrl);
        toast.success('이미지가 업로드되었습니다.');
      } else {
        toast.error('이미지 업로드에 실패했습니다.');
      }
    } catch (error) {
      toast.error('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 이미지 파일만 허용
      if (!file.type.startsWith('image/')) {
        toast.error('이미지 파일만 업로드할 수 있습니다.');
        return;
      }
      // 파일 크기 제한 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('파일 크기는 5MB 이하여야 합니다.');
        return;
      }
      handleImageUpload(file);
    }
  };

  const removeImage = () => {
    setProfileImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      // 1. 프로필 이미지 업데이트 (이미지가 변경된 경우)
      if (profileImageUrl && profileImageUrl !== user.profileImageUrl) {
        const imageResult = await updateProfileImage({
          profileImageUrl: profileImageUrl || '',
        });

        if (!imageResult.ok) {
          toast.error(
            imageResult.message ||
              '프로필 이미지 업데이트 중 오류가 발생했습니다.'
          );
          return;
        }

        // 프로필 이미지도 세션에 반영
        await update({
          image: profileImageUrl,
        });
      }

      // 2. 기본 정보 업데이트
      const result = await updateUserProfile({
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber || undefined,
      });

      if (result.ok) {
        // 세션 업데이트
        await update({
          name: data.name,
          email: data.email,
        });

        toast.success('프로필이 성공적으로 수정되었습니다.');
        onOpenChange(false);
      } else {
        toast.error(result.message || '프로필 수정 중 오류가 발생했습니다.');
      }
    } catch (error) {
      toast.error('프로필 수정 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>프로필 수정</DialogTitle>
          <DialogDescription>
            프로필 정보를 수정할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* 프로필 이미지 업로드 */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profileImageUrl} alt="프로필 이미지" />
                  <AvatarFallback className="text-2xl">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                {profileImageUrl && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="-top-2 -right-2 absolute h-6 w-6 rounded-full p-0"
                    onClick={removeImage}
                    disabled={isUploadingImage || isSubmitting}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>

              <div className="flex flex-col items-center space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isUploadingImage || isSubmitting}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage || isSubmitting}
                  className="flex items-center gap-2"
                >
                  {isUploadingImage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {profileImageUrl ? '이미지 변경' : '이미지 업로드'}
                </Button>
                <p className="text-muted-foreground text-xs">
                  JPG, PNG, GIF (최대 5MB)
                </p>
              </div>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이름</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이메일</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>연락처</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="연락처를 입력해주세요"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                저장
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
