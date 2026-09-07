import { type SharedSpace, sharedSpaces } from '@/@data/living-shared-spaces';
import { SectionCaption, SectionSubtitleSm } from '@/components/common';
import Image from 'next/image';
import type { ComponentPropsWithoutRef } from 'react';

function GridItem(
  props: { item: SharedSpace } & ComponentPropsWithoutRef<'div'>
) {
  const { item, className, ...rest } = props;
  return (
    <div className={className} {...rest}>
      <div className="subtitle-2xl-medium mb-[12px]">{item.name}</div>
      <div className="body-sm-regular mb-[16px]">{item.description}</div>
      <Image
        src={item.image}
        alt=""
        width={4960}
        height={2196}
        className="h-[335px] w-full object-cover lg:h-[549px]"
      />
    </div>
  );
}

function SharedSpaceGrid() {
  return (
    <div className="grid grid-cols-2 gap-x-[22px] gap-y-[40px]">
      <GridItem item={sharedSpaces[0]} className="col-span-2" />
      <GridItem item={sharedSpaces[1]} className="col-span-2" />
      <GridItem item={sharedSpaces[2]} className="col-span-2 lg:col-span-1" />
      <GridItem item={sharedSpaces[3]} className="col-span-2 lg:col-span-1" />
      <GridItem item={sharedSpaces[4]} className="col-span-2" />
    </div>
  );
}

export default function SectionSharedSpaces() {
  return (
    <section className="layout-horizontal p-section-vertical">
      <div className="mb-[60px]">
        <SectionCaption>SHARED SPACES</SectionCaption>
        <SectionSubtitleSm>
          브리카 이촌은 A동과 B동, 두 개의 동으로 이루어져 있습니다.{'\n'}A동은
          주거 전용 공간으로 구성되어 있으며,{'\n'}B동은 주거시설과 오피스,
          그리고 입주민을 위한 다양한 공용 시설이 함께 마련되어 있습니다.
        </SectionSubtitleSm>
      </div>
      <SharedSpaceGrid />
    </section>
  );
}
