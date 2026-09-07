'use client';

import { signIn } from '@/@actions/auth/signIn';
import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

type LoginFormValue = {
  login: string;
  password: string;
};

export default function LoginForm() {
  const { handleSubmit, register } = useForm<LoginFormValue>();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('callbackUrl');
  const router = useRouter();
  const { update } = useSession();

  const _handleSubmit = async (data: LoginFormValue) => {
    const { login, password } = data;

    const result = await signIn({ email: login, password });

    // const result = await signIn('credentials', {
    //   login,
    //   password,
    //   redirectTo: redirectUrl || '/',
    //   redirect: false,
    // });

    if (result.ok) {
      toast.success('로그인 성공');
      // 세션 갱신
      await update();
      router.replace(redirectUrl || result.data.redirectTo || '/');
    } else {
      toast.error(
        result.message ||
          '로그인에 실패했습니다. 아이디 또는 비밀번호를 확인해주세요.'
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(_handleSubmit)}
      className="flex flex-col gap-5"
    >
      <Input {...register('login')} placeholder="아이디를 입력해주세요." />
      <Input
        {...register('password')}
        placeholder="비밀번호를 입력해주세요."
        type="password"
      />
      <Button type="submit" className="w-full">
        로그인
      </Button>
    </form>
  );
}
