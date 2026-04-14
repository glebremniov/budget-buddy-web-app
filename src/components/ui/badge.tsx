import { cn } from '@/lib/cn';
import { type BadgeProps, badgeVariants } from './badge-variants';

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge };
