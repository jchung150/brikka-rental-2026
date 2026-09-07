import { officeFaqs } from '@/@data/office-faqs';
import { SectionCaption } from '@/components/common';
import FaqAccordion from '@/components/faq-accordion';

export default function SectionFaqs() {
  return (
    <section className="layout-horizontal p-section-vertical">
      <div className="mb-[34px] lg:mb-[60px]">
        <SectionCaption>FAQ</SectionCaption>
      </div>
      <div className="mb-[34px]">
        <FaqAccordion faqs={officeFaqs} />
      </div>
      <div className="body-sm-regular text-coolgray-600">
        *프라이빗 오피스 입주 및 이용과 관련된 자주 묻는 질문을 확인할 수
        있습니다
      </div>
      {/* <div className="body-sm-regular flex flex-col items-center gap-[13px] rounded-[2px] border border-coolgray-700 p-[22px] text-apc-black-a60">
        <div>더 자세한 정보가 필요하신가요?</div>
        <div className="flex flex-col gap-x-[4px] text-center lg:flex-row">
          <div>전화: 02-1234-5678</div>
          <div className="hidden lg:block">|</div>
          <div>이메일: hello@brikka.kr</div>
        </div>
      </div> */}
    </section>
  );
}
