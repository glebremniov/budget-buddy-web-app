import { createRootRoute } from '@tanstack/react-router';
import { NotFoundComponent } from '@/components/layout/NotFoundComponent';
import { RootComponent } from '@/components/layout/RootComponent';
import { RootErrorComponent } from '@/components/layout/RootErrorComponent';

export const Route = createRootRoute({
  component: RootComponent,
  errorComponent: RootErrorComponent,
  notFoundComponent: NotFoundComponent,
});
