'use client';
import { createUser } from '@/@actions/users/createUser';
import { Namespace } from '@/@hooks/query-keys';
import { zodResolver } from '@hookform/resolvers/zod';
import { Strings } from '@repo/common/strings';
import {
  UserPermissionType,
  type UserRole,
} from '@repo/database/generated/client';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import {} from '@repo/design-system/components/ui/select';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { CheckUserPermissionField } from './check-user-permission-field';

interface CreateUserFormProps {
  user?: { id: number; name: string; email: string; phoneNumber: string };
  type: UserRole;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, '이름은 필수입니다'),
  email: z.string().email('이메일 형식이 올바르지 않습니다'),
  phoneNumber: z.string().optional(),
  password: z.string().min(1, '비밀번호는 필수입니다'),
  userRole: z.string(),
  permissions: z.array(z.nativeEnum(UserPermissionType)).optional(),
});

type FormType = z.infer<typeof formSchema>;

export function UserForm({
  user,
  type,
  onSuccess,
  onCancel,
}: CreateUserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = user;
  const typeLabel = Strings.userRole[type];
  const action = isEdit ? '수정' : '등록';
  const queryClient = useQueryClient();

  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      phoneNumber: user?.phoneNumber ?? '',
      password: '',
      userRole: type,
      permissions: [],
    },
  });

  const { handleSubmit } = form;

  // 폼 제출 처리
  const onSubmit = async (formData: FormType) => {
    const { name, email, phoneNumber, password, userRole, permissions } =
      formData;

    if (!name || !email || (!password && !isEdit)) {
      toast.error('필수 항목을 모두 입력해주세요.');
      return;
    }

    if (!userRole) {
      toast.error('사용자 유형을 선택해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createUser({
        name,
        email,
        phoneNumber: phoneNumber,
        password,
        userRole: userRole as UserRole,
        permissions,
      });

      if (result.ok) {
        toast.success(`${typeLabel}가 성공적으로 등록되었습니다.`);
        onSuccess?.();
        queryClient.invalidateQueries({
          queryKey: [Namespace.User],
          exact: false,
        });
      } else {
        toast.error(result.message || '사용자 등록 중 오류가 발생했습니다.');
      }
    } catch (error) {
      toast.error('사용자 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <CheckUserPermissionField />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>이름</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="이름을 입력해 주세요"
                  disabled={isSubmitting}
                />
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
              <FormLabel required>이메일</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="이메일을 입력해 주세요"
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
              <FormDescription>로그인에 사용됩니다.</FormDescription>
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
                  placeholder="연락처를 입력해 주세요"
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!isEdit && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>비밀번호</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="비밀번호를 입력해 주세요"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {action}
          </Button>
        </div>
      </form>
    </Form>
  );
}
