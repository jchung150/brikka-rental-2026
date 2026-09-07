import LivingIndividualSpaceDialog from '@/components/living-individual-space-dialog';
import SectionBook from '@/components/section-book';
import SectionFaqs from './_components/section-faqs';
import SectionFloorGuide from './_components/section-floor-guide';
import SectionGreetings from './_components/section-greetings';
import SectionIndividualSpaces from './_components/section-individual-spaces';
import SectionIntro from './_components/section-intro';
import SectionMap from './_components/section-map';
import SectionSharedSpaces from './_components/section-shared-spaces';
import LivingProvider from './_context';

export default function LivingPage() {
  return (
    <LivingProvider>
      <div>
        <SectionIntro />
        <SectionGreetings />
        <SectionFloorGuide />
        <SectionSharedSpaces />
        <SectionIndividualSpaces />
        <SectionFaqs />
        <SectionMap />
        <SectionBook />
      </div>
      <LivingIndividualSpaceDialog />
    </LivingProvider>
  );
}
