import * as DialogPrimitives from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/cn';

const Dialog = DialogPrimitives.Root;

const DialogTrigger = DialogPrimitives.Trigger;

const DialogPortal = DialogPrimitives.Portal;

const DialogClose = DialogPrimitives.Close;

function DialogOverlay({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitives.Overlay> & {
  ref?: React.Ref<React.ElementRef<typeof DialogPrimitives.Overlay>>;
}) {
  return (
    <DialogPrimitives.Overlay
      ref={ref}
      className={cn(
        'fixed inset-0 z-[200] bg-black/80 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  hideClose,
  ref: forwardedRef,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitives.Content> & {
  hideClose?: boolean;
  ref?: React.Ref<React.ElementRef<typeof DialogPrimitives.Content>>;
}) {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const hiddenCloseRef = React.useRef<HTMLButtonElement>(null);
  const dragState = React.useRef({
    isDragging: false,
    startY: 0,
    rafId: 0,
    pendingDelta: 0,
    // Sliding window of recent (timestamp, delta) samples used to derive
    // dismiss velocity on pointer-up — a fast flick should dismiss even if
    // the absolute drag distance is below the static threshold.
    samples: [] as { t: number; d: number }[],
  });
  // Track pending transitionend listeners so we can clean them up if the
  // component unmounts mid-animation (e.g. portal destruction).
  const pendingListeners = React.useRef<Set<{ el: HTMLElement; fn: () => void }>>(new Set());

  React.useEffect(() => {
    const listeners = pendingListeners.current;
    return () => {
      for (const { el, fn } of listeners) {
        el.removeEventListener('transitionend', fn);
      }
      listeners.clear();
    };
  }, []);

  const addTransitionEndListener = React.useCallback((el: HTMLElement, fn: () => void) => {
    const entry = { el, fn };
    const wrapped = () => {
      fn();
      el.removeEventListener('transitionend', wrapped);
      pendingListeners.current.delete(entry);
    };
    entry.fn = wrapped;
    pendingListeners.current.add(entry);
    el.addEventListener('transitionend', wrapped);
  }, []);

  const combinedRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      contentRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef)
        (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    },
    [forwardedRef],
  );

  const cancelPendingFrame = React.useCallback(() => {
    if (dragState.current.rafId) {
      cancelAnimationFrame(dragState.current.rafId);
      dragState.current.rafId = 0;
    }
  }, []);

  const snapBack = React.useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    dragState.current.isDragging = false;
    cancelPendingFrame();
    el.style.transition = 'transform 0.3s ease';
    el.style.transform = 'translateY(0)';
    addTransitionEndListener(el, () => {
      if (contentRef.current) {
        contentRef.current.style.transform = '';
        contentRef.current.style.transition = '';
        contentRef.current.style.willChange = '';
      }
    });
  }, [addTransitionEndListener, cancelPendingFrame]);

  const handlePointerDown = React.useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragState.current = {
      isDragging: true,
      startY: e.clientY,
      rafId: 0,
      pendingDelta: 0,
      samples: [{ t: e.timeStamp, d: 0 }],
    };
    if (contentRef.current) {
      contentRef.current.style.willChange = 'transform';
      contentRef.current.style.transition = 'none';
    }
  }, []);

  const handlePointerMove = React.useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const state = dragState.current;
    if (!state.isDragging) return;
    state.pendingDelta = Math.max(0, e.clientY - state.startY);
    state.samples.push({ t: e.timeStamp, d: state.pendingDelta });
    // Keep only ~120ms of history so velocity reflects the *recent* motion.
    const cutoff = e.timeStamp - 120;
    while (state.samples.length > 2 && state.samples[0].t < cutoff) {
      state.samples.shift();
    }
    if (state.rafId) return;
    state.rafId = requestAnimationFrame(() => {
      state.rafId = 0;
      if (contentRef.current) {
        contentRef.current.style.transform = `translateY(${state.pendingDelta}px)`;
      }
    });
  }, []);

  const handlePointerUp = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const state = dragState.current;
      if (!state.isDragging) return;
      cancelPendingFrame();
      const delta = e.clientY - state.startY;

      // Velocity in px/ms over the last ~120ms (downward = positive).
      const samples = state.samples;
      let velocity = 0;
      if (samples.length >= 2) {
        const first = samples[0];
        const last = samples[samples.length - 1];
        const dt = last.t - first.t;
        if (dt > 0) velocity = (last.d - first.d) / dt;
      }
      // Dismiss when dragged far enough, or when the *recent* motion was a
      // downward flick (even if the finger lifted near the start). The
      // `delta > 20` floor prevents accidental dismissal from a stationary
      // tap that registers a tiny jitter.
      const shouldDismiss = delta > 80 || (velocity > 0.5 && delta > 20);

      if (shouldDismiss) {
        state.isDragging = false;
        const el = contentRef.current;
        if (el) {
          // Faster exit when the flick was fast.
          const exitMs = velocity > 0.8 ? 160 : 220;
          el.style.transition = `transform ${exitMs}ms ease-in`;
          el.style.transform = 'translateY(100vh)';
          addTransitionEndListener(el, () => {
            hiddenCloseRef.current?.click();
          });
        }
      } else {
        snapBack();
      }
    },
    [snapBack, addTransitionEndListener, cancelPendingFrame],
  );

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitives.Content
        ref={combinedRef}
        className={cn(
          'fixed z-[200] grid w-full gap-4 border bg-background shadow-lg',
          // Mobile: Bottom Sheet — extra top padding to clear the drag handle
          'bottom-0 left-0 max-w-none rounded-t-xl border-x-0 border-b-0 translate-y-0 max-h-[90dvh] overflow-y-auto',
          'px-6 pt-12 pb-6',
          'data-[state=open]:animate-in-bottom-sheet data-[state=closed]:animate-out-bottom-sheet',
          // Desktop: Centered Dialog
          'sm:bottom-auto sm:left-[50%] sm:top-[50%] sm:max-w-lg sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg sm:border sm:max-h-none sm:overflow-y-visible sm:p-6 sm:data-[state=open]:animate-fade-in sm:data-[state=closed]:animate-fade-out',
          className,
        )}
        {...props}
      >
        {/* Drag handle — mobile only. The interactive region is taller than
            the visible pill so a thumb can comfortably grab anywhere in the
            sheet's top padding without precision. */}
        <div
          className="sm:hidden absolute top-0 inset-x-0 h-12 flex items-start justify-center pt-3 touch-none cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={snapBack}
        >
          <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Hidden close — triggered programmatically on swipe dismiss */}
        <DialogPrimitives.Close
          ref={hiddenCloseRef}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
        />

        {children}

        {!hideClose && (
          <DialogPrimitives.Close className="absolute right-4 top-4 sm:top-4 rounded-sm opacity-70 ring-offset-background transition hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground cursor-pointer active:scale-90 motion-reduce:transition-none">
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitives.Close>
        )}
      </DialogPrimitives.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitives.Title> & {
  ref?: React.Ref<React.ElementRef<typeof DialogPrimitives.Title>>;
}) {
  return (
    <DialogPrimitives.Title
      ref={ref}
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitives.Description> & {
  ref?: React.Ref<React.ElementRef<typeof DialogPrimitives.Description>>;
}) {
  return (
    <DialogPrimitives.Description
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
