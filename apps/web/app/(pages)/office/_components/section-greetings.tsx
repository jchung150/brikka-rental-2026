import { BrDesktop } from '@/components/common';

export default function SectionGreetings() {
  return (
    <section className="layout-horizontal p-section-vertical">
      <div className="body-lg-regular flex flex-col gap-[12px]">
        <p>
          서울 한가운데, 브리카 이촌에는 <BrDesktop />
          일과 휴식이 자연스럽게 이어지는 <b>프라이빗 오피스</b>가 있습니다.
        </p>
        <p>
          모든 오피스는 독립된 호실로 구성되어 있으며, <BrDesktop />
          주거 공간과 완전히 분리된 전용 출입구를 통해 <BrDesktop />
          <b>24시간 자유롭게</b> 이용할 수 있습니다.
        </p>
        <p>
          미팅룸, 컨퍼런스룸, 캔틴 등 <BrDesktop />
          업무의 효율과 여유를 함께 담은 <b>공용 시설</b>도 갖추고 있습니다.{' '}
          <BrDesktop />
          집처럼 편안하면서도 집중이 필요한 하루를 위한, <BrDesktop />
          당신만의 오피스를 만나보세요.
        </p>
      </div>
    </section>
  );
}
