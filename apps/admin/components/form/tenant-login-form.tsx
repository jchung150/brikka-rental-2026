'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

export default function TenantLoginForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
  };

  return (
    <div className="flex w-full max-w-[468px] flex-col items-center gap-[40px]">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mx-auto w-full space-y-[16px] rounded-[4px] border border-[#dee3e8] px-[24px] py-[20px]"
        >
          <div className="mb-[24px] text-center">
            <h1 className="subtitle-base-xl-bold mb-[4px]">로그인</h1>
            <p className="text-[15px] text-gray-500">
              입주자 포털에 로그인해 주세요
            </p>
          </div>
          <div className="space-y-[12px]">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <span className="body-sm-bold">이메일</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="이메일을 입력해 주세요"
                      {...field}
                      className="h-[50px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <span className="body-sm-bold">이메일</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="이메일을 입력해 주세요"
                      {...field}
                      className="h-[50px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button
            type="submit"
            variant="apc-filled"
            size="apc-md"
            className="w-full"
          >
            로그인
          </Button>
        </form>
      </Form>
      <div className="body-sm-regular text-muted-foreground">
        로그인이 안되시나요?{' '}
        <Link href="#" className="underline">
          관리자 문의하기
        </Link>
      </div>
    </div>
  );
}
