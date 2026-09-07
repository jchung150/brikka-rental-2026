import './styles.css';
import { DesignSystemProvider } from '@repo/design-system';
import { indivisible, mgothic210 } from '@repo/design-system/lib/fonts';
import { cn } from '@repo/design-system/lib/utils';
import { createMetadata } from '@repo/seo/metadata';
import type { ReactNode } from 'react';

type RootLayoutProperties = {
  readonly children: ReactNode;
};

export const metadata = createMetadata({
  title: '브리카',
  description: '브리카 랜딩 페이지',
});

const RootLayout = ({ children }: RootLayoutProperties) => (
  <html
    lang="ko"
    className={cn(mgothic210.className, indivisible.variable, 'scroll-smooth')}
    suppressHydrationWarning
  >
    <body>
      <DesignSystemProvider defaultTheme="light">
        <div className="text-apc-black-900">{children}</div>
      </DesignSystemProvider>
    </body>
  </html>
);

export default RootLayout;
