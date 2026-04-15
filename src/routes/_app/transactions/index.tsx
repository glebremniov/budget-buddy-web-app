import { createFileRoute } from '@tanstack/react-router';
import { TransactionsSkeleton } from '@/components/transactions/TransactionsSkeleton';
import { categoriesQueryOptions } from '@/hooks/useCategories';
import { transactionsQueryOptions } from '@/hooks/useTransactions';
import { queryClient } from '@/lib/query-client';

export const Route = createFileRoute('/_app/transactions/')({
  pendingComponent: TransactionsSkeleton,
  validateSearch: () => ({
    // Previous parameters were add/edit, now they are no longer used for routing to the modal
  }),
  loader: () => {
    // Pre-fetch the first page of transactions and categories in parallel
    return Promise.all([
      queryClient.ensureQueryData(
        transactionsQueryOptions({
          page: 0,
          size: 20,
          sort: 'desc',
        }),
      ),
      queryClient.ensureQueryData(categoriesQueryOptions()),
    ]);
  },
});
