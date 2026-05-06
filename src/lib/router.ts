import { createRouter } from '@tanstack/react-router';
import { RouteLoader } from '@/components/layout/RouteLoader';
import { routeTree } from '@/routeTree.gen';

export const router = createRouter({
  routeTree,
  defaultPendingComponent: RouteLoader,
  defaultPendingMs: 100,
  defaultPendingMinMs: 300,
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
});
