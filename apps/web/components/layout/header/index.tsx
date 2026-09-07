import { env } from '@/env';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@repo/design-system/components/ui/hover-card';
import { ChevronDownIcon } from 'lucide-react';
import LogoLink from './logo-link';
import MobileSheet from './mobile-sheet';
import NavLink from './nav-link';

type NavItem = {
  label: string;
  href: string;
  children?: NavItem[];
};

export const navItems: NavItem[] = [
  // {
  //   label: '소개',
  //   href: '/introduction',
  // },
  // {
  //   label: '공간',
  //   href: '/spaces',
  //   children: [
  //     {
  //       label: '브리카 이촌',
  //       href: '/spaces',
  //     },
  //   ],
  // },
  // {
  //   label: '이야기',
  //   href: '/story',
  // },
  {
    label: "LIVING",
    href: '/living',
  },
  {
    label: "OFFICE",
    href: '/office',
  },
  {
    label: 'BOOK',
    href: '/book',
  },
  {
    label: 'RESIDENT PORTAL',
    href: env.NEXT_PUBLIC_ADMIN_TENANT_LOGIN_URL,
  },
];

function Mobile() {
  return (
    <header className="layout-horizontal body-base-medium relative flex h-[80px] items-center justify-between">
      <LogoLink />
      <MobileSheet />
    </header>
  );
}

function Desktop() {
  return (
    <header className="layout-horizontal grid h-[80px] grid-cols-[1fr_108px_1fr] items-center">
      <ul className="body-base-medium flex items-center">
        {navItems.slice(0, 3).map((item) => {
          if (item.children) {
            return (
              <HoverCard key={item.label} openDelay={100} closeDelay={0}>
                <HoverCardTrigger asChild>
                  <div>
                    <NavLink
                      href={item.href}
                      label={item.label}
                      icon={<ChevronDownIcon />}
                      className="body-base-medium px-[24px]"
                    />
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-fit">
                  <ul className="flex flex-col gap-[8px]">
                    {item.children.map((child) => (
                      <li key={child.label}>
                        <NavLink
                          href={child.href}
                          label={child.label}
                          className="body-base-medium"
                        />
                      </li>
                    ))}
                  </ul>
                </HoverCardContent>
              </HoverCard>
            );
          }
          return (
            <NavLink
              key={item.label}
              href={item.href}
              label={item.label}
              className="body-base-medium px-[24px]"
            />
          );
        })}
      </ul>
      <LogoLink />
      <div className="flex items-center justify-end">
        <NavLink
          href={navItems[3].href}
          label={navItems[3].label}
          className="body-base-medium px-[24px]"
        />
      </div>
    </header>
  );
}

export default function Header() {
  return (
    <div className="sticky top-0 z-20 bg-white shadow">
      <div className="block lg:hidden">
        <Mobile />
      </div>
      <div className="hidden lg:block">
        <Desktop />
      </div>
    </div>
  );
}
