'use client';

import { LogOut, Menu, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { Avatar } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { ROUTES } from '../../lib/routes';
import { useAuth } from '../../providers/AuthProvider';
import { useToast } from '../../providers/ToastProvider';

export function Topbar({ onMenuClick }: { onMenuClick: () => void }): React.ReactElement {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [loggingOut, setLoggingOut] = React.useState(false);

  async function handleLogout(): Promise<void> {
    setLoggingOut(true);
    try {
      await logout();
      router.push(ROUTES.auth.login);
    } catch {
      showToast({ title: 'Logout failed. Please try again.', variant: 'error' });
    } finally {
      setLoggingOut(false);
    }
  }

  const displayName = user?.name || user?.email || 'Account';

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface px-4">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>
      <div className="hidden md:block" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center gap-2 rounded-md p-1 hover:bg-surface-inset"
            disabled={loggingOut}
          >
            <Avatar label={displayName} />
            <span className="hidden text-sm font-medium text-text-primary sm:inline">
              {displayName}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => router.push(ROUTES.settings.profile)}>
            <UserIcon className="h-4 w-4" /> Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => void handleLogout()} className="text-error">
            <LogOut className="h-4 w-4" /> Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
