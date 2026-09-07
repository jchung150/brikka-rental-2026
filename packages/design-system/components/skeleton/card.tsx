import { cn } from '@repo/design-system/lib/utils';
import { Skeleton } from '../ui/skeleton';

interface CardSkeletonProps {
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
  showImage?: boolean;
  showActions?: boolean;
  lines?: number;
}

export function CardSkeleton({
  className,
  variant = 'default',
  showImage = true,
  showActions = true,
  lines = 3,
}: CardSkeletonProps) {
  const isCompact = variant === 'compact';
  const isDetailed = variant === 'detailed';

  return (
    <div
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        isCompact && 'p-3',
        !isCompact && 'p-6',
        className
      )}
    >
      {/* Image */}
      {showImage && (
        <div className="mb-4">
          <Skeleton
            className={cn(
              'w-full bg-muted',
              isCompact ? 'h-24' : isDetailed ? 'h-48' : 'h-32'
            )}
          />
        </div>
      )}

      {/* Header */}
      <div className="mb-3">
        <Skeleton
          className={cn('mb-2', isCompact ? 'h-4 w-3/4' : 'h-5 w-4/5')}
        />
        {isDetailed && <Skeleton className="h-3 w-1/2" />}
      </div>

      {/* Content Lines */}
      <div className="mb-4 space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn('h-3', i === lines - 1 ? 'w-2/3' : 'w-full')}
          />
        ))}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-20" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      )}
    </div>
  );
}

// Card Grid Skeleton
interface CardGridSkeletonProps {
  className?: string;
  count?: number;
  variant?: 'default' | 'compact' | 'detailed';
  columns?: 1 | 2 | 3 | 4;
}

export function CardGridSkeleton({
  className,
  count = 6,
  variant = 'default',
  columns = 3,
}: CardGridSkeletonProps) {
  return (
    <div
      className={cn(
        'grid gap-4',
        columns === 1 && 'grid-cols-1',
        columns === 2 && 'grid-cols-1 md:grid-cols-2',
        columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        columns === 4 &&
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} variant={variant} />
      ))}
    </div>
  );
}
