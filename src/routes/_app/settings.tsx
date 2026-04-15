import { createFileRoute } from '@tanstack/react-router';
import { SettingsSkeleton } from '@/components/settings/SettingsSkeleton';

export const Route = createFileRoute('/_app/settings')({
  pendingComponent: SettingsSkeleton,
});
