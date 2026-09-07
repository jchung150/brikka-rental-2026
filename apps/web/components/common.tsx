import { cn } from '@repo/design-system/lib/utils';
import type { ComponentPropsWithoutRef } from 'react';

export function BrMobile() {
  return <br className="block lg:hidden" />;
}

export function BrDesktop() {
  return <br className="hidden lg:block" />;
}

export function SectionCaption(props: ComponentPropsWithoutRef<'div'>) {
  const { className, children, ...rest } = props;
  return (
    <div
      className={cn(
        'subtitle-lg-semibold mb-[16px] font-indivisible text-apc-orange-500',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function SectionTitle(props: ComponentPropsWithoutRef<'div'>) {
  const { className, children, ...rest } = props;
  return (
    <h2 className={cn('title-3xl-4xl-bold mb-[12px]', className)} {...rest}>
      {children}
    </h2>
  );
}

export function SectionTitleSm(props: ComponentPropsWithoutRef<'div'>) {
  const { className, children, ...rest } = props;
  return (
    <h2
      className={cn(
        'mb-[12px] text-[24px] leading-[120%] tracking-[-0.72px] lg:font-bold lg:text-[36px]',
        className
      )}
      {...rest}
    >
      {children}
    </h2>
  );
}

export function SectionSubtitle(props: ComponentPropsWithoutRef<'div'>) {
  const { className, children, ...rest } = props;
  return (
    <p
      className={cn('body-lg-regular whitespace-pre-wrap', className)}
      {...rest}
    >
      {children}
    </p>
  );
}

export function SectionSubtitleSm(props: ComponentPropsWithoutRef<'div'>) {
  const { className, children, ...rest } = props;
  return (
    <p
      className={cn(
        'body-sm-regular whitespace-pre-wrap text-apc-black-a60',
        className
      )}
      {...rest}
    >
      {children}
    </p>
  );
}
