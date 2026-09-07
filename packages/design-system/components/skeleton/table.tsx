import { cn } from '@repo/design-system/lib/utils';
import { Skeleton } from '../ui/skeleton';

interface TableSkeletonProps {
  className?: string;
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  showPagination?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

export function TableSkeleton({
  className,
  rows = 5,
  columns = 4,
  showHeader = true,
  showPagination = true,
  variant = 'default',
}: TableSkeletonProps) {
  const isCompact = variant === 'compact';
  const isDetailed = variant === 'detailed';

  return (
    <div className={cn('w-full', className)}>
      {/* Table */}
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header */}
            {showHeader && (
              <thead className="border-b bg-muted/50">
                <tr>
                  {Array.from({ length: columns }).map((_, i) => (
                    <th
                      key={i}
                      className={cn(
                        'px-4 py-3 text-left font-medium text-muted-foreground text-sm',
                        isCompact && 'px-2 py-2',
                        isDetailed && 'px-6 py-4'
                      )}
                    >
                      <Skeleton className="h-4 w-20" />
                    </th>
                  ))}
                </tr>
              </thead>
            )}

            {/* Body */}
            <tbody className="divide-y">
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-muted/50">
                  {Array.from({ length: columns }).map((_, colIndex) => (
                    <td
                      key={colIndex}
                      className={cn(
                        'px-4 py-3 text-sm',
                        isCompact && 'px-2 py-2',
                        isDetailed && 'px-6 py-4'
                      )}
                    >
                      <Skeleton
                        className={cn(
                          'h-4 rounded',
                          colIndex === 0
                            ? 'w-24'
                            : colIndex === columns - 1
                              ? 'w-16'
                              : 'w-32'
                        )}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      )}
    </div>
  );
}

// Data Table Skeleton (with toolbar)
interface DataTableSkeletonProps {
  className?: string;
  rows?: number;
  columns?: number;
  showToolbar?: boolean;
  showPagination?: boolean;
}

export function DataTableSkeleton({
  className,
  rows = 5,
  columns = 4,
  showToolbar = true,
  showPagination = true,
}: DataTableSkeletonProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      {showToolbar && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-10 w-64 rounded-md" />
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-10 w-24 rounded-md" />
            <Skeleton className="h-10 w-20 rounded-md" />
          </div>
        </div>
      )}

      {/* Table */}
      <TableSkeleton
        rows={rows}
        columns={columns}
        showPagination={showPagination}
      />
    </div>
  );
}

// Table Row Skeleton
interface TableRowSkeletonProps {
  className?: string;
  columns?: number;
  variant?: 'default' | 'compact' | 'detailed';
}

export function TableRowSkeleton({
  className,
  columns = 4,
  variant = 'default',
}: TableRowSkeletonProps) {
  const isCompact = variant === 'compact';
  const isDetailed = variant === 'detailed';

  return (
    <tr className={cn('hover:bg-muted/50', className)}>
      {Array.from({ length: columns }).map((_, colIndex) => (
        <td
          key={colIndex}
          className={cn(
            'px-4 py-3 text-sm',
            isCompact && 'px-2 py-2',
            isDetailed && 'px-6 py-4'
          )}
        >
          <Skeleton
            className={cn(
              'h-4 rounded',
              colIndex === 0
                ? 'w-24'
                : colIndex === columns - 1
                  ? 'w-16'
                  : 'w-32'
            )}
          />
        </td>
      ))}
    </tr>
  );
}

// Table Header Skeleton
interface TableHeaderSkeletonProps {
  className?: string;
  columns?: number;
  variant?: 'default' | 'compact' | 'detailed';
}

export function TableHeaderSkeleton({
  className,
  columns = 4,
  variant = 'default',
}: TableHeaderSkeletonProps) {
  const isCompact = variant === 'compact';
  const isDetailed = variant === 'detailed';

  return (
    <thead className={cn('border-b bg-muted/50', className)}>
      <tr>
        {Array.from({ length: columns }).map((_, i) => (
          <th
            key={i}
            className={cn(
              'px-4 py-3 text-left font-medium text-muted-foreground text-sm',
              isCompact && 'px-2 py-2',
              isDetailed && 'px-6 py-4'
            )}
          >
            <Skeleton className="h-4 w-20" />
          </th>
        ))}
      </tr>
    </thead>
  );
}
