import { createFileRoute } from '@tanstack/react-router';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { categoriesQueryOptions } from '@/hooks/useCategories';
import { allTransactionsQueryOptions } from '@/hooks/useTransactions';
import { todayIso, toLocalIsoDate } from '@/lib/formatters';
import { queryClient } from '@/lib/query-client';

export const Route = createFileRoute('/_app/')({
  pendingComponent: DashboardSkeleton,
  loader: () => {
    const now = new Date();
    const firstDayOfMonth = toLocalIsoDate(new Date(now.getFullYear(), now.getMonth(), 1));
    const today = todayIso();

    return Promise.all([
      queryClient.ensureQueryData(
        allTransactionsQueryOptions({
          start: firstDayOfMonth,
          end: today,
          sort: 'desc',
        }),
      ),
      queryClient.ensureQueryData(categoriesQueryOptions()),
    ]);
  },
});
