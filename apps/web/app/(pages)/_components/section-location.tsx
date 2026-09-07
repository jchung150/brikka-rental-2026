import {
  BrMobile,
  SectionCaption,
  SectionSubtitle,
  SectionTitle,
  SectionTitleSm,
} from '@/components/common';
import { Button } from '@repo/design-system/components/ui/button';
import { ArrowRightIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function SectionLocation() {
  return (
    <section className="layout-horizontal p-section-vertical">
      <div className="mb-[60px]">
        <SectionCaption>LOCATION</SectionCaption>
        <SectionTitleSm>
          특별한 매력을 가진 <BrMobile />브리카 이촌을 둘러보세요.
        </SectionTitleSm>
        <SectionSubtitle className='mb-[20px]'>
          브리카의 첫 번째 공간 ‘브리카 이촌’은 1인/2인 가구를 위한 주거와 오피스가 함께하는 특별한 공간입니다. 서울의 중심인 용산에 자리해 있으면서 한강에 인접해 있어 도심의 편리함과 자연의 여유를 동시에 누릴 수 있습니다.
        </SectionSubtitle>
        <ul className='text-coolgray-750 body-lg-regular flex flex-col'>
        <li>+ 서울의 중심지 용산</li>
        <li>+ 주거와 오피스가 함께하는 공간</li>
        <li>+ 이촌 한강공원 도보 7분</li>
        </ul>
      </div>
      <div className="flex flex-col items-center">
        <div className="mb-[12px] w-full max-w-[554px]">
          <div className="relative w-full pt-[70%]">
            <Image
              src="/images/home/location_2217x1552.png"
              alt=""
              fill
              className="object-cover"
              sizes="554px"
            />
          </div>
        </div>
        <Link href="/office">
          <Button
            variant="apc-outlined"
            className="rounded-none active:bg-apc-black-900 active:text-white-100 max-lg:h-[54px]"
            size="apc-md"
          >
            <span>브리카 이촌 더 알아보기</span>
            <ArrowRightIcon className="size-[24px]" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
