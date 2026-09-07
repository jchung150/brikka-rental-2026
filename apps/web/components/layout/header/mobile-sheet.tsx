'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@repo/design-system/components/ui/accordion';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@repo/design-system/components/ui/sheet';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { navItems } from '.';
import LogoLink from './logo-link';
import NavLink from './nav-link';

export default function MobileSheet() {
  const [open, setOpen] = useState(false);

  const closeSheet = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild onClick={closeSheet}>
        <Image
          src="/images/menu_72x72.png"
          alt="메뉴"
          width={18}
          height={18}
          className="mr-[6px]"
        />
      </SheetTrigger>
      <SheetContent className="pt-[24px]">
        <SheetHeader>
          <SheetTitle>
            <LogoLink onClick={closeSheet} />
          </SheetTitle>
          <SheetDescription>브리카 랜딩 페이지 모바일</SheetDescription>
        </SheetHeader>
        <div className="p-[16px]">
          <ul className="subtitle-2xl-medium flex flex-col gap-[12px]">
            {navItems.slice(0, 3).map((item) => {
              if (item.children) {
                return (
                  <Accordion
                    key={item.label}
                    type="single"
                    collapsible
                    className="w-full"
                  >
                    <AccordionItem value={item.label}>
                      <AccordionTrigger className="py-0">
                        <div className="subtitle-2xl-medium">{item.label}</div>
                      </AccordionTrigger>
                      <AccordionContent className="flex flex-col gap-[16px] text-balance pb-0">
                        <ul className="flex flex-col gap-[8px] p-[16px]">
                          {item.children.map((child) => (
                            <li key={child.label}>
                              <NavLink
                                href={child.href}
                                label={child.label}
                                className="subtitle-lg-medium"
                                onClick={closeSheet}
                              />
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                );
              }
              return (
                <NavLink
                  key={item.label}
                  href={item.href}
                  label={item.label}
                  onClick={closeSheet}
                />
              );
            })}
          </ul>
        </div>
        <SheetFooter>
          <Button variant="apc-filled">
            <Link href={navItems[3].href} target="_blank">
              {navItems[3].label}
            </Link>
          </Button>
          <SheetClose asChild>
            <Button variant="apc-outlined">닫기</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
