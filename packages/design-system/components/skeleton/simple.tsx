import { cn } from '@repo/design-system/lib/utils';
import { Skeleton } from '../ui/skeleton';

interface SimpleSkeletonProps {
  className?: string;
  variant?: 'text' | 'avatar' | 'button' | 'badge' | 'input';
  size?: 'sm' | 'md' | 'lg';
  width?: string | number;
  height?: string | number;
}

export function SimpleSkeleton({
  className,
  variant = 'text',
  size = 'md',
  width,
  height,
}: SimpleSkeletonProps) {
  const sizeClasses = {
    sm: 'h-3',
    md: 'h-4',
    lg: 'h-6',
  };

  const variantClasses = {
    text: 'rounded',
    avatar: 'rounded-full',
    button: 'rounded-md',
    badge: 'rounded-full',
    input: 'rounded-md',
  };

  const defaultSizes = {
    text: { width: '100%', height: sizeClasses[size] },
    avatar: {
      width:
        size === 'sm' ? 'w-6 h-6' : size === 'md' ? 'w-8 h-8' : 'w-12 h-12',
      height: '',
    },
    button: { width: 'w-20', height: 'h-8' },
    badge: { width: 'w-16', height: 'h-5' },
    input: { width: 'w-full', height: 'h-10' },
  };

  const defaultSize = defaultSizes[variant];
  const finalWidth = width || defaultSize.width;
  const finalHeight = height || defaultSize.height;

  return (
    <Skeleton
      className={cn(
        variantClasses[variant],
        !width && !height && defaultSize.width,
        !width && !height && defaultSize.height,
        className
      )}
      style={{
        width: typeof finalWidth === 'number' ? `${finalWidth}px` : finalWidth,
        height:
          typeof finalHeight === 'number' ? `${finalHeight}px` : finalHeight,
      }}
    />
  );
}

// Text Block Skeleton
interface TextBlockSkeletonProps {
  className?: string;
  lines?: number;
  lastLineWidth?: string;
}

export function TextBlockSkeleton({
  className,
  lines = 3,
  lastLineWidth = '75%',
}: TextBlockSkeletonProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4 rounded',
            i === lines - 1 ? `w-[${lastLineWidth}]` : 'w-full'
          )}
        />
      ))}
    </div>
  );
}

// Avatar Skeleton
interface AvatarSkeletonProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function AvatarSkeleton({
  className,
  size = 'md',
}: AvatarSkeletonProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <Skeleton className={cn('rounded-full', sizeClasses[size], className)} />
  );
}

// Button Skeleton
interface ButtonSkeletonProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  width?: string;
}

export function ButtonSkeleton({
  className,
  size = 'md',
  variant = 'default',
  width = 'w-20',
}: ButtonSkeletonProps) {
  const sizeClasses = {
    sm: 'h-7',
    md: 'h-8',
    lg: 'h-10',
  };

  return (
    <Skeleton
      className={cn('rounded-md', sizeClasses[size], width, className)}
    />
  );
}

// Input Skeleton
interface InputSkeletonProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  width?: string;
}

export function InputSkeleton({
  className,
  size = 'md',
  width = 'w-full',
}: InputSkeletonProps) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
  };

  return (
    <Skeleton
      className={cn('rounded-md', sizeClasses[size], width, className)}
    />
  );
}
