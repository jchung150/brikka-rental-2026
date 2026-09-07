'use client';

import 'swiper/css';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { Autoplay } from 'swiper/modules';
import { Swiper, type SwiperRef, SwiperSlide } from 'swiper/react';

const images = [
  '/images/office/banner_4096x2643.jpg',
  '/images/office/office_space_2.jpg',
  '/images/office/office_space_3.jpg',
  '/images/office/office_space_4.jpg',
  '/images/office/office_space_5.jpg',
];

function OfficeIntroSwiperPagination({
  activeIndex,
  total,
}: { activeIndex: number; total: number }) {
  return (
    <div className="absolute right-[24px] bottom-[24px] z-10">
      <div className="flex h-[34px] w-[64px] items-center justify-center rounded-full bg-black-a50">
        <span className="body-sm-medium text-white leading-[160%] tracking-wider">
          {activeIndex + 1}/{total}
        </span>
      </div>
    </div>
  );
}

export default function OfficeIntroSwiper() {
  const swiperRef = useRef<SwiperRef>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="relative">
      <Swiper
        ref={swiperRef}
        slidesPerView={1}
        speed={500}
        spaceBetween={0}
        autoplay={{
          delay: 5000,
        }}
        loop={true}
        modules={[Autoplay]}
        onActiveIndexChange={(swiper) => {
          setActiveIndex(swiper.activeIndex);
        }}
      >
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <div className="relative w-full pt-[130%] xs:pt-[75%] md:pt-[50%] xl:pt-[37%]">
              <Image
                src={image}
                fill
                sizes="100vw"
                alt=""
                className="object-cover object-[center_30%]"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <OfficeIntroSwiperPagination
        activeIndex={activeIndex}
        total={images.length}
      />
    </div>
  );
}
