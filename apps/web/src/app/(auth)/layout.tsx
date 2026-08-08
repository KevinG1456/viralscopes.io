import Image from 'next/image';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-4 py-12">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/logo.svg" alt="ViralScopes" width={32} height={32} />
        <span className="text-lg font-semibold text-text-primary">ViralScopes</span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
      <p className="text-xs text-text-tertiary">
        <Link href="/privacy" className="hover:underline">
          Privacy Policy
        </Link>
        {' · '}
        <Link href="/terms" className="hover:underline">
          Terms of Service
        </Link>
      </p>
    </div>
  );
}
