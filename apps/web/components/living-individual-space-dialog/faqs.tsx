import FaqAccordion from '../faq-accordion';

export default function Faqs({
  faqs,
}: { faqs: { question: string; answer: string }[] }) {
  return (
    <section className="pb-[50px]">
      <h3 className="subtitle-lg-semibold mb-[16px] font-indivisible lg:mb-[32px]">
        FAQ
      </h3>
      <FaqAccordion faqs={faqs} />
    </section>
  );
}
