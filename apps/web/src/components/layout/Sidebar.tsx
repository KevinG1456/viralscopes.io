'use client';

import { Bell, Home, ListChecks, Settings, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ROUTES } from '../../lib/routes';
import { cn } from '../../lib/utils/cn';

const NAV_ITEMS = [
  { href: ROUTES.home, label: 'Home', icon: Home, matchPrefix: ROUTES.home },
  {
    href: ROUTES.watchlists,
    label: 'Watchlists',
    icon: ListChecks,
    matchPrefix: ROUTES.watchlists,
  },
  { href: ROUTES.alerts, label: 'Alerts', icon: Bell, matchPrefix: ROUTES.alerts },
  { href: ROUTES.settings.profile, label: 'Settings', icon: Settings, matchPrefix: '/settings' },
  {
    href: ROUTES.admin.prompts,
    label: 'AI Prompts',
    icon: Sparkles,
    matchPrefix: ROUTES.admin.prompts,
  },
] as const;

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }): React.ReactElement {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {NAV_ITEMS.map(({ href, label, icon: Icon, matchPrefix }) => {
        const active = pathname === matchPrefix || pathname.startsWith(`${matchPrefix}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-primary-subtle text-primary'
                : 'text-text-secondary hover:bg-surface-inset hover:text-text-primary',
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar(): React.ReactElement {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-border px-4">
        <span className="text-lg font-semibold text-text-primary">ViralScopes</span>
      </div>
      <SidebarNav />
    </aside>
  );
}
