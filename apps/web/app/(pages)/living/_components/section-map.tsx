'use client';

import { SectionCaption } from '@/components/common';
import dynamic from 'next/dynamic';

const BrikkaMap = dynamic(() => import('@/components/brikka-map'), {
  ssr: false,
});

export default function SectionMap() {
  return (
    <section className="layout-horizontal p-section-vertical">
      <div className="mb-[24px] lg:mb-[40px]">
        <SectionCaption>MAP</SectionCaption>
      </div>
      <div className="mb-[24px]">
        <BrikkaMap />
      </div>
      <div className="flex flex-col items-center gap-[8px] text-black">
        <div className="body-lg-medium">ADDRESS</div>
        <div className="body-base-medium">
          사무실 주소 서울 용산구 이촌로 26
        </div>
      </div>
    </section>
  );
}
