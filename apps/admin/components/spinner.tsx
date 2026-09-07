import { cn } from '@repo/design-system/lib/utils';
import { Loader2 } from 'lucide-react';
import { forwardRef } from 'react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  showText?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 'md', className, text = '로딩 중...', showText = false }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center gap-2',
          className
        )}
      >
        <Loader2
          className={cn(
            'animate-spin text-muted-foreground',
            sizeClasses[size]
          )}
        />
        {showText && (
          <p
            className={cn(
              'font-medium text-muted-foreground',
              textSizeClasses[size]
            )}
          >
            {text}
          </p>
        )}
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

// 간단한 로딩 스피너 (텍스트 없이)
export const SimpleSpinner = forwardRef<
  HTMLDivElement,
  Omit<SpinnerProps, 'text' | 'showText'>
>(({ size = 'md', className }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex items-center justify-center py-12', className)}
    >
      <Loader2
        className={cn('animate-spin text-muted-foreground', sizeClasses[size])}
      />
    </div>
  );
});

SimpleSpinner.displayName = 'SimpleSpinner';

// 전체 화면 로딩 스피너
export const FullScreenSpinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 'lg', className, text = '로딩 중...', showText = true }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm',
          className
        )}
      >
        <Spinner size={size} text={text} showText={showText} />
      </div>
    );
  }
);

FullScreenSpinner.displayName = 'FullScreenSpinner';
