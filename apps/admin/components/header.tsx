'use client';
import { SidebarTrigger } from '@repo/design-system/components/ui/sidebar';
import { cn } from '@repo/design-system/lib/utils';
import React from 'react';

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  fixed?: boolean;
  ref?: React.Ref<HTMLElement>;
}

export const Header = ({
  className,
  fixed,
  children,
  ...props
}: HeaderProps) => {
  const [offset, setOffset] = React.useState(0);

  React.useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop);
    };

    // Add scroll listener to the body
    document.addEventListener('scroll', onScroll, { passive: true });

    // Clean up the event listener on unmount
    return () => document.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'flex h-14 items-center gap-3 border-b p-4 sm:gap-4',
        fixed && 'sticky top-0 z-50 w-full backdrop-blur-sm',
        className
      )}
      {...props}
    >
      <SidebarTrigger variant="outline" className="scale-125 sm:scale-100" />
      {/* <Separator orientation="vertical" className="h-6" /> */}
      {children}
    </header>
  );
};

Header.displayName = 'Header';
