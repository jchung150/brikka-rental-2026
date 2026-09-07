import { cn } from '@repo/design-system/lib/utils';
import { Skeleton } from '../ui/skeleton';

interface ListSkeletonProps {
  className?: string;
  count?: number;
  variant?: 'default' | 'compact' | 'detailed';
  showAvatar?: boolean;
  showActions?: boolean;
}

export function ListSkeleton({
  className,
  count = 5,
  variant = 'default',
  showAvatar = true,
  showActions = true,
}: ListSkeletonProps) {
  const isCompact = variant === 'compact';
  const isDetailed = variant === 'detailed';

  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'flex items-center space-x-3 rounded-lg border bg-card p-3',
            isCompact && 'py-2',
            isDetailed && 'py-4'
          )}
        >
          {/* Avatar */}
          {showAvatar && (
            <Skeleton
              className={cn(
                'flex-shrink-0 rounded-full',
                isCompact ? 'h-8 w-8' : isDetailed ? 'h-12 w-12' : 'h-10 w-10'
              )}
            />
          )}

          {/* Content */}
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton
                className={cn(
                  'rounded',
                  isCompact ? 'h-4 w-32' : isDetailed ? 'h-5 w-48' : 'h-4 w-40'
                )}
              />
              {showActions && (
                <div className="flex space-x-2">
                  <Skeleton className="h-6 w-6 rounded" />
                  <Skeleton className="h-6 w-6 rounded" />
                </div>
              )}
            </div>

            {!isCompact && (
              <Skeleton
                className={cn('h-3 rounded', isDetailed ? 'w-3/4' : 'w-2/3')}
              />
            )}

            {isDetailed && (
              <div className="flex items-center space-x-4">
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-3 w-12 rounded" />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// List Item Skeleton
interface ListItemSkeletonProps {
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
  showAvatar?: boolean;
  showActions?: boolean;
}

export function ListItemSkeleton({
  className,
  variant = 'default',
  showAvatar = true,
  showActions = true,
}: ListItemSkeletonProps) {
  const isCompact = variant === 'compact';
  const isDetailed = variant === 'detailed';

  return (
    <div
      className={cn(
        'flex items-center space-x-3 rounded-lg border bg-card p-3',
        isCompact && 'py-2',
        isDetailed && 'py-4',
        className
      )}
    >
      {/* Avatar */}
      {showAvatar && (
        <Skeleton
          className={cn(
            'flex-shrink-0 rounded-full',
            isCompact ? 'h-8 w-8' : isDetailed ? 'h-12 w-12' : 'h-10 w-10'
          )}
        />
      )}

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton
            className={cn(
              'rounded',
              isCompact ? 'h-4 w-32' : isDetailed ? 'h-5 w-48' : 'h-4 w-40'
            )}
          />
          {showActions && (
            <div className="flex space-x-2">
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-6 w-6 rounded" />
            </div>
          )}
        </div>

        {!isCompact && (
          <Skeleton
            className={cn('h-3 rounded', isDetailed ? 'w-3/4' : 'w-2/3')}
          />
        )}

        {isDetailed && (
          <div className="flex items-center space-x-4">
            <Skeleton className="h-3 w-16 rounded" />
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-3 w-12 rounded" />
          </div>
        )}
      </div>
    </div>
  );
}

// Search List Skeleton (with search bar)
interface SearchListSkeletonProps {
  className?: string;
  count?: number;
  showSearch?: boolean;
}

export function SearchListSkeleton({
  className,
  count = 5,
  showSearch = true,
}: SearchListSkeletonProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Bar */}
      {showSearch && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full rounded-md" />
          <div className="flex space-x-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
        </div>
      )}

      {/* List Items */}
      <ListSkeleton count={count} />
    </div>
  );
}
