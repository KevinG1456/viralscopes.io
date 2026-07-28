import * as ToastPrimitive from '@radix-ui/react-toast';
import * as React from 'react';

import { cn } from '../../lib/utils/cn';

export const ToastProvider = ToastPrimitive.Provider;
export const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      'fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col gap-2 p-4 sm:max-w-sm',
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = 'ToastViewport';

const VARIANT_CLASSES = {
  default: 'border-border bg-surface-elevated text-text-primary',
  success: 'border-success-border bg-success-subtle text-success-foreground',
  error: 'border-border-error bg-error-subtle text-error-foreground',
} as const;

export const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> & {
    variant?: keyof typeof VARIANT_CLASSES;
  }
>(({ className, variant = 'default', ...props }, ref) => (
  <ToastPrimitive.Root
    ref={ref}
    className={cn(
      'pointer-events-auto relative flex w-full items-center justify-between gap-3 rounded-md border p-4 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out',
      VARIANT_CLASSES[variant],
      className,
    )}
    {...props}
  />
));
Toast.displayName = 'Toast';

export const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title ref={ref} className={cn('text-sm font-medium', className)} {...props} />
));
ToastTitle.displayName = 'ToastTitle';

export const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn('shrink-0 text-text-tertiary hover:text-text-primary', className)}
    aria-label="Dismiss"
    {...props}
  >
    ×
  </ToastPrimitive.Close>
));
ToastClose.displayName = 'ToastClose';
