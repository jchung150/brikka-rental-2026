'use client';

import { cn } from '@repo/design-system/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavLink({
  href,
  label,
  className,
  icon,
  onClick,
}: {
  href: string;
  label: string;
  className?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);
  return (
    <Link
      href={href}
      target={href.startsWith('http') ? '_blank' : '_self'}
      className={cn(
        'flex items-center gap-[8px]',
        isActive && 'text-apc-orange-500',
        className
      )}
      onClick={onClick}
    >
      {label}
      {icon}
    </Link>
  );
}
