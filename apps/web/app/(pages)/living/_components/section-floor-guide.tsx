import { SectionCaption, SectionSubtitleSm } from '@/components/common';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/components/ui/dialog';
import { cn } from '@repo/design-system/lib/utils';
import Image from 'next/image';
import type { ComponentPropsWithoutRef } from 'react';

const COLORS = {
  yellow: 'bg-[#FAE6A3]',
  black: 'bg-[#383838]',
  gray: 'bg-[#E9E9E9]',
  green: 'bg-[#85D48A]',
  blue: 'bg-[#A3D3FF]',
  none: 'bg-transparent',
};

function ItemContainer(
  props: ComponentPropsWithoutRef<'div'> & {
    bgColor?: 'yellow' | 'black' | 'gray' | 'green' | 'blue' | 'none';
  }
) {
  const { className, children, bgColor = 'yellow', ...rest } = props;
  return (
    <div
      className={cn(
        'flex items-center gap-[8px] px-[4px] font-medium text-[4px] xs:text-[6px] sm:text-[8px] lg:px-[16px] lg:text-[14px] xl:text-[16px]',
        {
          [COLORS.none]: bgColor === 'none',
          [COLORS.yellow]: bgColor === 'yellow',
          [COLORS.black]: bgColor === 'black',
          'text-white-a80': bgColor === 'black',
          [COLORS.gray]: bgColor === 'gray',
          [COLORS.green]: bgColor === 'green',
          [COLORS.blue]: bgColor === 'blue',
        },
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

function ItemTitle(
  props: ComponentPropsWithoutRef<'div'> & { type: 'A' | 'B' }
) {
  const { className, type, ...rest } = props;
  return (
    <div
      className={cn('flex flex-col items-start gap-[8px]', className)}
      {...rest}
    >
      <div className="subtitle-2xl-medium font-indivisible">
        BRIKKA - {type}
      </div>
      <div className="body-lg-medium">브리카 {type}동</div>
      <div className="h-[1px] w-[17px] bg-apc-black-500" />
    </div>
  );
}

function FloorGrid() {
  return (
    <div className="mb-[24px] grid grid-cols-[483fr_242fr_483fr] gap-x-[4px] gap-y-[4px] [grid-template-rows:84px_repeat(6,20px)] xs:[grid-template-rows:100px_repeat(6,32px)] lg:mb-[50px] lg:gap-x-[16px] lg:gap-y-[12px] sm:[grid-template-rows:100px_repeat(6,48px)] lg:[grid-template-rows:100px_repeat(6,74px)]">
      <ItemTitle
        type="A"
        className="col-start-1 col-end-2 row-start-1 row-end-2"
      />
      <ItemContainer className="col-start-1 col-end-2 row-start-2 row-end-3">
        <span className="font-indivisible">RFT</span>
        <span className="font-indivisible">Rooftop</span>
        <span>루프탑</span>
      </ItemContainer>
      <ItemContainer className="col-start-1 col-end-2 row-start-3 row-end-4">
        <span className="font-indivisible">5F</span>
        <span className="font-indivisible">Rooms</span>
        <span>개인호실</span>
      </ItemContainer>
      <ItemContainer className="col-start-1 col-end-2 row-start-4 row-end-5">
        <span className="font-indivisible">4F</span>
        <span className="font-indivisible">Rooms</span>
        <span>개인호실</span>
      </ItemContainer>
      <ItemContainer className="col-start-1 col-end-2 row-start-5 row-end-6">
        <span className="font-indivisible">3F</span>
        <span className="font-indivisible">Rooms</span>
        <span>개인호실</span>
      </ItemContainer>
      <ItemContainer
        className="col-start-1 col-end-2 row-start-6 row-end-7 flex gap-[4px] px-0 lg:gap-[12px] lg:px-0"
        bgColor="none"
      >
        <ItemContainer className="h-full flex-1">
          <span className="font-indivisible">Rooms</span>
          <span>개인 호실</span>
        </ItemContainer>
        <ItemContainer
          className="flex h-full flex-1 items-center gap-[4px] lg:gap-[12px]"
          bgColor="black"
        >
          <span className="font-indivisible">2F</span>
          <div>
            <span className="font-indivisible">Gallery</span>
            <span>갤러리</span>
          </div>
        </ItemContainer>
      </ItemContainer>
      <ItemContainer className="col-start-1 col-end-2 row-start-7 row-end-8">
        <span className="font-indivisible">1F</span>
        <span className="font-indivisible">Parking</span>
        <span>주차장</span>
      </ItemContainer>
      <ItemContainer
        className="col-start-2 col-end-3 row-start-6 row-end-8 flex flex-col items-center justify-center gap-[4px] lg:gap-[8px]"
        bgColor="gray"
      >
        <span className="font-indivisible">Central Staircase</span>
        <span>중앙 계단</span>
      </ItemContainer>
      <ItemTitle
        type="B"
        className="col-start-3 col-end-4 row-start-1 row-end-2"
      />
      <ItemContainer className="col-start-3 col-end-4 row-start-2 row-end-3">
        <span className="font-indivisible">RFT</span>
        <span className="font-indivisible">Rooftop</span>
        <span>루프탑</span>
      </ItemContainer>
      <ItemContainer
        className="col-start-3 col-end-4 row-start-3 row-end-4 flex gap-[4px] px-0 lg:gap-[12px] lg:px-0"
        bgColor="none"
      >
        <ItemContainer className="h-full flex-1">
          <span className="font-indivisible">5F</span>
          <span className="font-indivisible">Rooms</span>
          <span>개인호실</span>
        </ItemContainer>
        <ItemContainer className="h-full flex-1" bgColor="green">
          <span className="font-indivisible">5F</span>
          <span>플렉스룸</span>
        </ItemContainer>
      </ItemContainer>
      <ItemContainer
        className="col-start-3 col-end-4 row-start-4 row-end-5 flex gap-[4px] px-0 lg:gap-[12px] lg:px-0"
        bgColor="none"
      >
        <ItemContainer className="h-full flex-1">
          <span className="font-indivisible">4F</span>
          <span className="font-indivisible">Rooms</span>
          <span>개인호실</span>
        </ItemContainer>
        <ItemContainer
          className="flex h-full flex-1 items-center gap-[4px] lg:gap-[12px]"
          bgColor="blue"
        >
          <span className="font-indivisible">4F</span>
          <div>
            <span className="font-indivisible">Private Office</span>
            <div>프라이빗 오피스</div>
          </div>
        </ItemContainer>
      </ItemContainer>
      <ItemContainer
        className="col-start-3 col-end-4 row-start-5 row-end-6 flex gap-[4px] px-0 lg:gap-[12px] lg:px-0"
        bgColor="none"
      >
        <ItemContainer className="h-full flex-1">
          <span className="font-indivisible">3F</span>
          <span className="font-indivisible">Rooms</span>
          <span>개인호실</span>
        </ItemContainer>
        <ItemContainer
          className="flex h-full flex-1 items-center gap-[4px] lg:gap-[12px]"
          bgColor="blue"
        >
          <span className="font-indivisible">3F</span>
          <div>
            <span className="font-indivisible">Private Office</span>
            <div>프라이빗 오피스</div>
          </div>
        </ItemContainer>
      </ItemContainer>
      <ItemContainer
        className="col-start-3 col-end-4 row-start-6 row-end-7 flex items-center gap-[4px] lg:gap-[12px]"
        bgColor="green"
      >
        <span className="font-indivisible">2F</span>
        <div>
          <span className="font-indivisible">Cafe Brikka</span>
          <div>카페 브리카</div>
        </div>
      </ItemContainer>
      <ItemContainer className="col-start-3 col-end-4 row-start-7 row-end-8">
        <span className="font-indivisible">1F</span>
        <span className="font-indivisible">Parking</span>
        <span>주차장</span>
      </ItemContainer>
    </div>
  );
}

function FloorCaption() {
  const items = [
    {
      label: '개인 공간',
      bgColor: COLORS.yellow,
    },
    {
      label: '상업 공간',
      bgColor: COLORS.black,
    },
    {
      label: '공용 공간',
      bgColor: COLORS.green,
    },
    {
      label: '멤버 전용 공간',
      bgColor: COLORS.blue,
    },
  ];
  return (
    <div className="grid grid-cols-[84px_120px] gap-x-[24px] gap-y-[10px] lg:grid-cols-[116px_160px] lg:gap-x-[50px] lg:gap-y-[16px]">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-[6px] lg:gap-[12px]"
        >
          <div
            className={cn(
              item.bgColor,
              'size-[24px] rounded-full lg:size-[34px]'
            )}
          />
          <div className="font-medium text-[12px] md:text-[14px] xl:text-[16px]">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SectionFloorGuide() {
  return (
    <section className="layout-horizontal p-section-vertical">
      <div className="mb-[60px]">
        <SectionCaption>FLOOR GUIDE</SectionCaption>
        <SectionSubtitleSm>
          브리카 이촌은 A동과 B동, 두 개의 동으로 이루어져 있습니다.{'\n'}A동은
          주거 전용 공간으로 구성되어 있으며,{'\n'}B동은 주거시설과 오피스,
          그리고 입주민을 위한 다양한 공용 시설이 함께 마련되어 있습니다.
        </SectionSubtitleSm>
      </div>
      <Dialog>
        <DialogTrigger className="w-full">
          <FloorGrid />
        </DialogTrigger>
        <DialogContent className="w-[90vw] max-w-[90vw] p-0 md:max-w-[90vw]">
          <DialogTitle hidden>층별 안내도</DialogTitle>
          <div className="h-full w-full overflow-x-auto overflow-y-auto p-4">
            <Image
              src="/images/living/floor_guide_4960x2016.png"
              alt="층별 안내도"
              width={4960}
              height={2016}
              unoptimized
              className="min-w-[1000px] object-cover"
            />
          </div>
        </DialogContent>
      </Dialog>
      <FloorCaption />
    </section>
  );
}
