import SectionBook from '@/components/section-book';
import SectionFaqs from './_components/section-faqs';
import SectionGreetings from './_components/section-greetings';
import SectionIndividualSpaces from './_components/section-individual-spaces';
import SectionIntro from './_components/section-intro';
import SectionSharedSpaces from './_components/section-shared-spaces';

export default function OfficePage() {
  return (
    <div>
      <SectionIntro />
      <SectionGreetings />
      <SectionSharedSpaces />
      <SectionIndividualSpaces />
      <SectionFaqs />
      <SectionBook />
    </div>
  );
}
