import {
  SectionCaption,
  SectionSubtitle,
  SectionTitleSm,
} from '@/components/common';
import LivingFaqs from '@/components/living-faqs';

export default function SectionFaqs() {
  return (
    <section className="layout-horizontal p-section-vertical">
      <div className="mb-[60px]">
        <SectionCaption>FAQ</SectionCaption>
        <SectionTitleSm>
          브리카에 대해 궁금한 점들을 확인해보세요
        </SectionTitleSm>
        <SectionSubtitle>
          입주 과정부터 공간 이용까지 자주 하는 질문들을 확인할 수 있습니다.
        </SectionSubtitle>
      </div>
      <LivingFaqs />
    </section>
  );
}
