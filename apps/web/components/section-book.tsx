import { Button } from '@repo/design-system/components/ui/button';
import { ArrowRightIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { SectionCaption, SectionSubtitle, SectionTitleSm } from './common';

export default function SectionBook() {
  return (
    <section className="relative">
      <Image
        src="/images/tour/banner_5760x1984.png"
        alt=""
        fill
        className="object-cover object-bottom lg:[-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_100%)] lg:[mask-image:linear-gradient(to_bottom,transparent_0%,black_100%)]"
      />
      <div className="layout-horizontal relative z-10 py-[118px]">
        <div className="mb-[40px]">
          <SectionCaption className="text-center">BOOK</SectionCaption>
          <SectionTitleSm className="text-center">투어 예약하기</SectionTitleSm>
          <SectionSubtitle className="text-center">
            살수록 더 사랑하게 되는 집,
          </SectionSubtitle>
          <SectionSubtitle className="text-center">
            브리카를 직접 경험해 보세요.
          </SectionSubtitle>
        </div>
        <div className="flex justify-center">
          <Link href="/book">
            <Button
              variant="apc-filled"
              size="apc-md"
              className="h-[54px] rounded-none bg-apc-orange-400 text-apc-black-900 leading-1 md:h-[60px]"
            >
              <span>투어 예약하기</span>
              <ArrowRightIcon className="size-[24px] stroke-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
