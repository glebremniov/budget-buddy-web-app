import { createFileRoute } from '@tanstack/react-router';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { allTransactionsQueryOptions } from '@/hooks/useTransactions';
import { queryClient } from '@/lib/query-client';

export const Route = createFileRoute('/_app/')({
  pendingComponent: DashboardSkeleton,
  loader: () => {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const startDate = sixMonthsAgo.toISOString().split('T')[0];

    return queryClient.ensureQueryData(
      allTransactionsQueryOptions({
        start: startDate,
        sort: 'desc',
      }),
    );
  },
});
