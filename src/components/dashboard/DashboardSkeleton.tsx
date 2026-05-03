import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>

      {/* Month selector pills */}
      <div className="flex gap-2">
        {[28, 28, 28, 28].map((w, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
          <Skeleton key={i} className="h-7 rounded-pill" style={{ width: w * 1.2 }} />
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Card className="col-span-2 md:col-span-1">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-pill" />
              <Skeleton className="h-3 w-16" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-9 w-28" />
          </CardContent>
        </Card>
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-pill" />
                <Skeleton className="h-3 w-16" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Expenses by category */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-2 w-2 rounded-pill" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-pill" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent transactions */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between px-6 py-3">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-6 w-24 rounded-pill" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
