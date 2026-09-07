'use client';

import 'swiper/css';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { Autoplay } from 'swiper/modules';
import { Swiper, type SwiperRef, SwiperSlide } from 'swiper/react';

function OfficeIndividualSpaceSwiperPagination({
  activeIndex,
  total,
}: { activeIndex: number; total: number }) {
  return (
    <div className="absolute right-[16px] bottom-[16px] z-10">
      <div className="flex h-[34px] w-[64px] items-center justify-center rounded-full bg-black-a50">
        <span className="body-sm-medium translate-y-[1px] font-indivisible text-white tracking-wider">
          {activeIndex + 1}/{total}
        </span>
      </div>
    </div>
  );
}

export default function OfficeIndividualSpaceSwiper({
  images,
}: { images: string[] }) {
  const swiperRef = useRef<SwiperRef>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="relative">
      <Swiper
        className="min-w-0"
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
          <SwiperSlide key={index}>
            <div className="relative w-full pt-[100%]">
              <Image
                src={image}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                alt=""
                className="object-cover"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <OfficeIndividualSpaceSwiperPagination
        activeIndex={activeIndex}
        total={images.length}
      />
    </div>
  );
}
