import SectionBook from '@/components/section-book';
import SectionIntro from './_components/section-intro';
import SectionLocation from './_components/section-location';
import SectionStyle from './_components/section-styie';

export default function Home() {
  return (
    <div>
      <SectionIntro />
      <SectionLocation />
      <SectionStyle />
      <SectionBook />
    </div>
  );
}
