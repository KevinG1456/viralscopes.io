'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ROUTES } from '../../../lib/routes';
import { cn } from '../../../lib/utils/cn';

const TABS = [
  { href: ROUTES.settings.profile, label: 'Profile' },
  { href: ROUTES.settings.apiKeys, label: 'API Keys' },
  { href: ROUTES.settings.organisation, label: 'Organisation' },
] as const;

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-text-primary">Settings</h1>
      <div className="flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'border-b-2 px-3 py-2 text-sm font-medium',
              pathname === tab.href
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary',
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>
      {children}
    </div>
  );
}
