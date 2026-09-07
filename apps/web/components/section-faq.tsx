import {
  SectionCaption,
  SectionSubtitle,
  SectionTitle,
} from '@/components/common';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@repo/design-system/components/ui/accordion';

const faqs = [
  {
    question: '최소 거주 기간이 있나요?',
    answer: '최소 거주 기간이 있나요? 답변',
  },
  {
    question: '보증금은 얼마인가요?',
    answer: '보증금은 얼마인가요? 답변',
  },
  {
    question: '투어 신청은 어떻게 하나요?',
    answer: '투어 신청은 어떻게 하나요? 답변',
  },
  {
    question: '어떻게 입주 신청을 할 수 있나요?',
    answer: '어떻게 입주 신청을 할 수 있나요? 답변',
  },
  {
    question: '반려동물과 함께 이용할 수 있나요?',
    answer: '반려동물과 함께 이용할 수 있나요? 답변',
  },
];

function FaqAccordions() {
  return (
    <Accordion
      type="multiple"
      // collapsible
      className="mb-[120px] w-full space-y-[12px]"
      // defaultValue={faqs[0].question}
    >
      {faqs.map((faq) => (
        <AccordionItem
          key={faq.question}
          value={faq.question}
          className="border-[1.5px] border-apc-black-900 last:border-b-[1.5px]"
        >
          <AccordionTrigger plusIcon className="h-[72px] px-[24px] py-[16px]">
            <div className="body-sm-regular flex h-full items-center">
              {faq.question}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-[24px]">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

function ContactBox() {
  return (
    <div className="body-sm-regular flex flex-col items-center gap-[13px] border border-coolgray-700 p-[22px] text-apc-black-a60">
      <div>더 자세한 정보가 필요하신가요?</div>
      <div>전화: 02-1234-5678 | 이메일: hello@brikka.kr</div>
    </div>
  );
}

export default function SectionFaq() {
  return (
    <section className="layout-horizontal p-section-vertical">
      <div className="mb-[34px]">
        <SectionCaption>FAQ</SectionCaption>
        <SectionTitle>브리카에 대해 궁금한 점들을 확인해보세요</SectionTitle>
        <SectionSubtitle>
          입주 과정부터 공간 이용까지 자주 하는 질문들을 확인할 수 있습니다.
        </SectionSubtitle>
      </div>
      <FaqAccordions />
      <ContactBox />
    </section>
  );
}
