import { brikkaStyles } from '@/@data/brikka-style';
import {
  SectionCaption,
  SectionSubtitle,
  SectionTitleSm,
} from '@/components/common';
import { cn } from '@repo/design-system/lib/utils';
import Image from 'next/image';
import { Fragment } from 'react';

export default function SectionStyle() {
  return (
    <section className="layout-horizontal p-section-vertical">
      <div className="mb-[60px]">
        <SectionCaption>BRIKKA STYLE</SectionCaption>
        <SectionTitleSm>
          브리카가 제안하는 라이프 스타일을 만나보세요
        </SectionTitleSm>
        <SectionSubtitle>
          머무는 곳이 곧 나다워지는 곳, 브리카에서 일상의 깊이를 경험해보세요.
        </SectionSubtitle>
      </div>
      <ul className="grid grid-cols-1 gap-y-[24px] lg:grid-cols-[1fr_48px_1fr_48px_1fr]">
        {brikkaStyles.map((bStyle, index) => (
          <Fragment key={bStyle.id}>
            <li className="flex flex-col justify-between gap-[24px]">
              <div>
                <div className="body-base-medium mb-[12px]">{bStyle.title}</div>
                <div className="body-sm-regular line-clamp-5 whitespace-pre-wrap text-coolgray-800 tracking-tighter">
                  {bStyle.description}
                </div>
              </div>
              <div className="relative w-full pt-[121%]">
                <Image
                  src={bStyle.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 480px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>
            </li>
            <div
              className={cn(
                'mx-auto my-auto hidden h-[430px] w-[1px] bg-[#DEE3E8]',
                {
                  'lg:flex': index !== brikkaStyles.length - 1,
                }
              )}
            />
            <div
              className={cn('block xs:hidden h-[1px] w-full bg-[#DEE3E8]', {
                hidden: index === brikkaStyles.length - 1,
              })}
            />
          </Fragment>
        ))}
      </ul>
    </section>
  );
}
