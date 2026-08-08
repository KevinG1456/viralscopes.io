import type { Metadata } from 'next';

import './globals.css';
import { CookieConsentBanner } from '../components/common/CookieConsentBanner';
import { Providers } from '../providers/index';

export const metadata: Metadata = {
  title: 'ViralScopes.io',
  description: 'AI-powered content intelligence for creators, agencies, and media teams.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <Providers>
          {children}
          <CookieConsentBanner />
        </Providers>
      </body>
    </html>
  );
}
