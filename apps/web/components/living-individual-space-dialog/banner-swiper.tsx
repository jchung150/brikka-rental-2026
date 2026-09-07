'use client';

import 'swiper/css';
import { useIsMobile } from '@repo/design-system/hooks/use-mobile';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Autoplay } from 'swiper/modules';
import { Swiper, type SwiperRef, SwiperSlide } from 'swiper/react';

function BottomSwiper({
  images,
  parentActiveIndex,
  goToParentSlideIndexOf,
}: {
  images: string[];
  parentActiveIndex: number;
  goToParentSlideIndexOf: (index: number) => void;
}) {
  const isMobile = useIsMobile();
  const swiperRef = useRef<SwiperRef>(null);

  const handleClickSlide = useCallback(
    (index: number) => {
      const swiper = swiperRef.current?.swiper;
      if (!swiper) {
        return;
      }
      swiper.slideTo(index, 500);
      goToParentSlideIndexOf(index);
    },
    [goToParentSlideIndexOf]
  );

  // 부모 activeIndex 변경 시 동일 인덱스로 이동
  useEffect(() => {
    const swiper = swiperRef.current?.swiper;
    if (!swiper) {
      return;
    }
    swiper.slideTo(parentActiveIndex, 500);
  }, [parentActiveIndex]);

  return (
    <Swiper
      ref={swiperRef}
      slidesPerView={isMobile ? 3.2 : 5}
      speed={500}
      spaceBetween={isMobile ? 4 : 12}
    >
      {images.map((image, index) => (
        <SwiperSlide key={index} className="h-full">
          <button
            type="button"
            key={index}
            onClick={() => handleClickSlide(index)}
            className="block h-full w-full"
          >
            <div className="relative h-[68px] lg:h-[144px]">
              <Image src={image} fill alt="" className="object-cover" />
            </div>
          </button>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

function BannerSwiperPagination({
  activeIndex,
  total,
}: { activeIndex: number; total: number }) {
  return (
    <div className="absolute right-[16px] bottom-[16px] z-10">
      <div className="flex h-[34px] w-[64px] items-center justify-center rounded-full bg-black-a50">
        <span className="body-sm-medium translate-y-[1px] font-indivisible text-white leading-none tracking-wider">
          {activeIndex + 1}/{total}
        </span>
      </div>
    </div>
  );
}

export default function BannerSwiper({ images }: { images: string[] }) {
  const swiperRef = useRef<SwiperRef>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const goToSlideIndexOf = useCallback((index: number) => {
    const swiper = swiperRef.current?.swiper;
    if (!swiper) {
      return;
    }
    swiper.slideTo(index, 500);
  }, []);

  return (
    <div className="mb-[50px] min-w-0">
      <div className="relative mb-[4px] h-[250px] lg:mb-[16px] lg:h-[534px]">
        <Swiper
          ref={swiperRef}
          slidesPerView={1}
          speed={500}
          spaceBetween={0}
          autoplay={{
            delay: 5000,
          }}
          modules={[Autoplay]}
          onActiveIndexChange={(swiper) => {
            setActiveIndex(swiper.activeIndex);
          }}
        >
          {images.map((image, index) => (
            <SwiperSlide key={index} className="h-full">
              <div className="relative h-[250px] lg:h-[534px]">
                <Image src={image} fill alt="" className="object-cover" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <BannerSwiperPagination
          activeIndex={activeIndex}
          total={images.length}
        />
      </div>
      <BottomSwiper
        images={images}
        parentActiveIndex={activeIndex}
        goToParentSlideIndexOf={goToSlideIndexOf}
      />
    </div>
  );
}
