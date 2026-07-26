import type { Metadata } from 'next';

import './globals.css';

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
      <body>{children}</body>
    </html>
  );
}
