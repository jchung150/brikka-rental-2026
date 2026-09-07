import LoginForm from '@/components/login-form';
import Image from 'next/image';

export default function TenantLoginPage() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-[25px] max-md:px-[20px] lg:gap-[50px]">
      <Image
        src="/images/logo_432x144.png"
        alt="브리카"
        width={192}
        height={38}
      />
      <LoginForm />
    </div>
  );
}
