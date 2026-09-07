import Image from 'next/image';

export default function SectionIntro() {
  return (
    <section>
      <div className="relative w-full pt-[130%] sm:pt-[34%]">
        <Image
          src="/images/spaces/banner_5760x1932.png" // [todo] 피그마 이미지
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
          unoptimized
        />
        <div className="layout-horizontal display-4xl-bold absolute inset-0 flex items-center justify-center text-white-100">
          <div>브리카 이촌</div>
        </div>
      </div>
    </section>
  );
}
