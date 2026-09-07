'use client';

import Footer from '@/components/layout/footer';
import { pretendard } from '@repo/design-system/lib/fonts';
import type NextError from 'next/error';
import Image from 'next/image';
import Link from 'next/link';

type GlobalErrorProperties = {
  readonly error: NextError & { digest?: string };
  readonly reset: () => void;
};

const GlobalError = ({ error, reset }: GlobalErrorProperties) => {
  return (
    <html lang="en" className={pretendard.className}>
      <body>
        <div>
          <div className="layout-horizontal flex flex-col items-center p-section-vertical">
            <h1 className="subtitle-2xl-medium mb-[12px]">ERROR</h1>
            <div className="body-sm-regular mb-[30px] text-center text-apc-black-a60">
              <div>오류가 발생했습니다.</div>
              <div>알 수 없는 오류가 발생했습니다.</div>
            </div>

            <Image
              src="/images/not_found_1176x1176.png"
              alt=""
              width={294}
              height={294}
              className="mb-[30px] object-cover"
            />
            <Link href="/" className="body-base-medium text-apc-black-a60">
              홈으로 이동하기
            </Link>
          </div>
          <Footer />
        </div>
      </body>
    </html>
  );
};

export default GlobalError;
