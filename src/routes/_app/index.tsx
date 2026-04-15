import { createFileRoute } from '@tanstack/react-router';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { allTransactionsQueryOptions } from '@/hooks/useTransactions';
import { toLocalIsoDate } from '@/lib/formatters';
import { queryClient } from '@/lib/query-client';

export const Route = createFileRoute('/_app/')({
  pendingComponent: DashboardSkeleton,
  loader: () => {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const startDate = toLocalIsoDate(sixMonthsAgo);

    return queryClient.ensureQueryData(
      allTransactionsQueryOptions({
        start: startDate,
        sort: 'desc',
      }),
    );
  },
});
