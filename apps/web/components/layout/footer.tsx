import Image from 'next/image';

function LogoImage() {
  return (
    <Image
      src="/images/logo_white_600x120.png"
      alt="브리카"
      width={150}
      height={30}
      className="h-[30px] w-[150px]"
    />
  );
}

function Info() {
  return (
    <ul className="body-sm-regular flex flex-col gap-[2px] text-white-a60 lg:gap-[6px]">
      <li>스토리즈어밀리언(주) | 대표 정주안</li>
      <li>
        사무실 주소 서울 용산구 이촌로 26 (이촌동 210-1) 브리카이촌 B동 502호
      </li>
      <li>사업자 등록 번호 870-88-03272</li>
      <li>대표 메일 master@storiesamillion.com</li>
      <li>통신판매업 신고번호</li>
      <li>개인정보 처리방침 | 서비스 이용약관</li>
    </ul>
  );
}

function Divider() {
  return <div className="my-[24px] h-[1px] w-full bg-white-200 lg:my-[40px]" />;
}

export default function Footer() {
  return (
    <footer className="bg-apc-black-500 text-white-100">
      <div className="layout-horizontal p-section-vertical">
        <div className="flex flex-col gap-x-[156px] gap-y-[24px] lg:flex-row">
          <LogoImage />
          <Info />
        </div>
        <Divider />
        <div className="body-sm-medium text-center text-white-a60">
          Copyright &copy; 2025 Stories A Million Corp. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
