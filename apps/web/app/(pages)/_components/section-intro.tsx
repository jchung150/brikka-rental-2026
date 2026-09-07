import { BrDesktop } from '@/components/common';
import { cn } from '@repo/design-system/lib/utils';
import Image from 'next/image';
import type { ComponentPropsWithoutRef } from 'react';

function OrangeBox(props: ComponentPropsWithoutRef<'div'>) {
  const { children, className, ...rest } = props;
  return (
    <div
      className={cn(
        'subtitle-2xl-medium flex h-[29px] w-fit items-center bg-apc-orange-400 px-3 pt-[4px] lg:h-[36px]',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export default function SectionIntro() {
  return (
    <section>
      <div className="relative w-full pt-banner-ratio">
        <Image
          src="/images/home/intro_4096x2901.png"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="layout-horizontal relative">
          <div className="absolute bottom-0 left-0 translate-y-[116px] p-layout-horizontal lg:translate-y-[144px]">
            <OrangeBox className="font-indivisible">THE MORE</OrangeBox>
            <OrangeBox className="font-indivisible">YOU LIVE,</OrangeBox>
            <OrangeBox className="translate-x-[74px] font-indivisible">
              THE MORE
            </OrangeBox>
            <OrangeBox className="translate-x-[28px] font-indivisible">
              YOU
            </OrangeBox>
            <OrangeBox className="translate-x-[28px] font-indivisible">
              LOVE.
            </OrangeBox>
            <OrangeBox className="translate-x-[83px]">살수록 더</OrangeBox>
            <OrangeBox className="translate-x-[111px]">사랑하게 되는</OrangeBox>
          </div>
        </div>
      </div>
      <div className="layout-horizontal mt-[162px] flex justify-end p-section-vertical pb-[80px] xl:mt-[0px]">
        <div>
          <div className="body-lg-medium">
            ‘어떤 공간이 오래도록 사랑받을 수 있을까?’
          </div>
          <p className="body-lg-regular">
            불필요한 과잉이 아닌, 꼭 필요한 것만을 남기는 일. 그것을 운영하는
            정확하고 정밀한 시스템. <BrDesktop />
            밝은 빛, 쾌적한 온도, 세심하게 정돈된 여유, 온실처럼 보호받으며,{' '}
            <BrDesktop />나 자신으로 존중받으며 머무를 수 있는 집.
          </p>
          <br />
          <p className="body-lg-regular">
            하나의 작은 질문에서 시작한 우리의 답, <BrDesktop />
            누군가에게 오래도록 사랑받을 수 있는 집이 만들어지게 되었습니다.
          </p>
          <div className="body-lg-medium">
            살수록 더 사랑하게 되는 집, 브리카를 소개합니다.
          </div>
        </div>
      </div>
    </section>
  );
}
