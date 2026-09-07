import {
  type IndividualSpace,
  individualSpaces,
} from '@/@data/office-individual-spaces';
import { SectionCaption, SectionSubtitleSm } from '@/components/common';
import OfficeIndividualSpaceSwiper from '@/components/office-individual-space-swiper';

function GridItem({ item }: { item: IndividualSpace }) {
  return (
    <div className="min-w-0">
      <div className="subtitle-lg-semibold mb-[16px] flex items-center justify-between">
        <div>{item.type}</div>
        <div>
          월 {item.price}만원부터{' '}
          <span className="text-coolgray-600">(VAT별도)</span>
        </div>
      </div>
      <ul className="body-lg-medium mb-[12px] flex flex-col items-end gap-[8px]">
        {item.options.map((option) => (
          <li key={option.label} className="flex items-center gap-[8px]">
            <div>{option.label}</div>
            <div className="h-[13px] w-[1px] bg-apc-black-500" />
            <div>{option.values.join(', ')}</div>
          </li>
        ))}
      </ul>
      <OfficeIndividualSpaceSwiper images={item.images} />
    </div>
  );
}

function IndividualSpaceGrid() {
  return (
    <div className="grid grid-cols-1 gap-y-[50px] lg:grid-cols-[1fr_120px_1fr]">
      <GridItem item={individualSpaces[0]} />
      <div className="hidden items-center justify-center lg:flex">
        <div className="h-[70%] w-[1px] bg-[#DEE3E8]" />
      </div>
      <GridItem item={individualSpaces[1]} />
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
      <IndividualSpaceGrid />
    </section>
  );
}
