'use client';

import 'swiper/css';
import { individualSpaces } from '@/@data/living-individual-spaces';
import { useLivingContextDispatch } from '@/app/(pages)/living/_context';
import { useIsMobile } from '@repo/design-system/hooks/use-mobile';
import Image from 'next/image';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

export default function LivingIndividualSpaceSwiper() {
  const isMobile = useIsMobile();
  const { setSelectedIndividualSpaceId } = useLivingContextDispatch();

  return (
    <div className="relative">
      <Swiper
        slidesPerView={isMobile ? 1.2 : 3.5}
        speed={500}
        spaceBetween={isMobile ? 24 : 40}
        autoplay={{
          delay: 5000,
        }}
        modules={[Autoplay]}
      >
        {individualSpaces.map((space) => (
          <SwiperSlide key={space.id}>
            <button
              type="button"
              className="text-left"
              onClick={() => setSelectedIndividualSpaceId(space.id)}
            >
              <div className="relative mb-[12px] w-full pt-[116%] md:mb-[16px]">
                <Image
                  src={space.images?.[0]}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  alt=""
                  className="object-cover"
                />
                <div className="absolute top-[16px] left-[16px] flex h-[22px] items-center justify-center bg-apc-orange-500 px-[8px] lg:h-[33px]">
                  <span className="body-base-semibold font-indivisible text-white leading-none">
                    {space.type}
                  </span>
                </div>
              </div>
              <div className="body-lg-bold mb-[6px] md:mb-[8px]">
                월 {space.monthlyRent}만원부터{' '}
                <span className="body-sm-medium text-coolgray-800">
                  (VAT별도)
                </span>
              </div>
              <div className="mb-[9px] h-[1px] w-[17px] bg-apc-black-500 md:mb-[12px]" />
              <div className="body-lg-medium">{space.title}</div>
              <p className="body-sm-regular text-apc-black-a60">
                {space.description}
              </p>
            </button>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
