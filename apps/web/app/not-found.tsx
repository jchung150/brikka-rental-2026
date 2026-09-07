import Footer from '@/components/layout/footer';
import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div>
      <div className="layout-horizontal flex flex-col items-center p-section-vertical">
        <h1 className="subtitle-2xl-medium mb-[12px]">404 ERROR</h1>
        <div className="body-sm-regular mb-[30px] text-center text-apc-black-a60">
          <div>죄송합니다. 페이지를 찾을 수 없습니다.</div>
          <div>존재하지 않는 주소를 입력하셨거나, </div>
          <div>요청하신 페이지의 주소가 변경 및 삭제되어 찾을 수 없습니다.</div>
        </div>
        <Image
          src="/images/not_found_1176x1176.png"
          alt=""
          width={294}
          height={294}
          className="mb-[30px] object-cover"
        />
        <Link href="/" className="body-base-medium text-apc-black-a60">
          홈으로 이동하기
        </Link>
      </div>
      <Footer />
    </div>
  );
}
