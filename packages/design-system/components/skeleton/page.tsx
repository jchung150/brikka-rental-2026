import { cn } from '@repo/design-system/lib/utils';
import { Skeleton } from '../ui/skeleton';

interface PageSkeletonProps {
  className?: string;
  showHeader?: boolean;
  showSidebar?: boolean;
  showBreadcrumb?: boolean;
}

export function PageSkeleton({
  className,
  showHeader = true,
  showSidebar = false,
  showBreadcrumb = true,
}: PageSkeletonProps) {
  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Header */}
      {showHeader && (
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <Skeleton className="h-8 w-32" />
            <div className="ml-auto flex items-center space-x-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Sidebar */}
        {showSidebar && (
          <div className="w-64 border-r bg-background">
            <div className="space-y-4 p-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1">
          <div className="container py-6">
            {/* Breadcrumb */}
            {showBreadcrumb && (
              <div className="mb-6">
                <Skeleton className="h-4 w-48" />
              </div>
            )}

            {/* Page Title */}
            <div className="mb-8">
              <Skeleton className="mb-2 h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>

            {/* Content Area */}
            <div className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-40 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
