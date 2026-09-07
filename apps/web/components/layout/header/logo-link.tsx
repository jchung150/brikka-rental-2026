import Image from 'next/image';
import Link from 'next/link';

export default function LogoLink({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/">
      <Image
        src="/images/logo_432x144.png"
        alt="브리카"
        width={108}
        height={36}
        onClick={onClick}
      />
    </Link>
  );
}
