import { createFileRoute } from '@tanstack/react-router';
import { CategoriesSkeleton } from '@/components/categories/CategoriesSkeleton';
import { categoriesQueryOptions } from '@/hooks/useCategories';
import { queryClient } from '@/lib/query-client';

export const Route = createFileRoute('/_app/categories/')({
  pendingComponent: CategoriesSkeleton,
  loader: () => {
    return queryClient.ensureQueryData(categoriesQueryOptions(200, 0));
  },
});
