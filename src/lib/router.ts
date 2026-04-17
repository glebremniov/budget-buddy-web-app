import { createRouter } from '@tanstack/react-router';
import { RouteLoader } from '@/components/layout/RouteLoader';
import { routeTree } from '@/routeTree.gen';

export const router = createRouter({
  routeTree,
  defaultPendingComponent: RouteLoader,
  defaultPendingMs: 100,
  defaultPendingMinMs: 300,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
