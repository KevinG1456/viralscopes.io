import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

import { SidebarNav } from './Sidebar';

export function MobileNav({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}): React.ReactElement {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-surface-overlay md:hidden" />
        <DialogPrimitive.Content className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-surface md:hidden">
          <DialogPrimitive.Title className="sr-only">Navigation</DialogPrimitive.Title>
          <div className="flex h-16 items-center justify-between border-b border-border px-4">
            <span className="text-lg font-semibold text-text-primary">ViralScopes</span>
            <DialogPrimitive.Close className="text-text-tertiary hover:text-text-primary">
              <X className="h-5 w-5" />
              <span className="sr-only">Close menu</span>
            </DialogPrimitive.Close>
          </div>
          <SidebarNav onNavigate={() => onOpenChange(false)} />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
