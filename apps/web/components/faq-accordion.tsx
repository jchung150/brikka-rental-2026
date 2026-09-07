import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@repo/design-system/components/ui/accordion';

export default function FaqAccordion({
  faqs,
}: { faqs: { question: string; answer: string }[] }) {
  return (
    <Accordion type="multiple" className="w-full space-y-[12px]">
      {faqs.map((faq) => (
        <AccordionItem
          key={faq.question}
          value={faq.question}
          className="border-[1.5px] border-apc-black-900 last:border-b-[1.5px]"
        >
          <AccordionTrigger
            plusIcon
            className="h-[60px] px-[24px] py-[16px] md:h-[72px]"
          >
            <div className="body-sm-regular flex h-full items-center">
              {faq.question}
            </div>
          </AccordionTrigger>
          <AccordionContent className="whitespace-pre-wrap px-[24px]">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
