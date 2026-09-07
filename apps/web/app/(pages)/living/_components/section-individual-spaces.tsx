import { type TermItem, termItems } from '@/@data/living-individual-spaces';
import { SectionCaption, SectionSubtitleSm } from '@/components/common';
import LivingIndividualSpaceSwiper from '@/components/living-individual-space-swiper';
import { cn } from '@repo/design-system/lib/utils';

function TermBox({ item }: { item: TermItem }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-[24px] px-[24px] py-[20px]',
        item.className
      )}
    >
      <div className="subtitle-2xl-medium">{item.title}</div>
      <div className="h-[1px] w-[17px] bg-apc-black-500" />
      <ul className="body-lg-regular">
        {item.options.map((option) => (
          <li key={option.label} className="flex items-center gap-[8px]">
            <div className="break-keep">{option.label}</div>
            <div className="h-[13px] w-[1px] bg-apc-black-500" />
            <div>{option.values.join(', ')}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TermBoxes() {
  return (
    <div className="mb-[50px] flex flex-col gap-[40px] md:flex-row">
      {termItems.map((item) => (
        <TermBox key={item.title} item={item} />
      ))}
    </div>
  );
}

export default function SectionIndividualSpaces() {
  return (
    <section className="layout-horizontal p-section-vertical">
      <div className="mb-[60px]">
        <SectionCaption>INDIVIDUAL SPACES</SectionCaption>
        <SectionSubtitleSm>
          브리카 이촌은 A동과 B동, 두 개의 동으로 이루어져 있습니다.{'\n'}
          A동은 주거 전용 공간으로 구성되어 있으며,{'\n'}B동은 주거시설과
          오피스, 그리고 입주민을 위한 다양한 공용 시설이 함께 마련되어
          있습니다.
        </SectionSubtitleSm>
      </div>
      <TermBoxes />
      <LivingIndividualSpaceSwiper />
    </section>
  );
}
