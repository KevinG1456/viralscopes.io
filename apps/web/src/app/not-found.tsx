import Link from 'next/link';

export default function NotFound(): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <h1 className="text-4xl font-bold text-text-primary">404</h1>
      <p className="text-md text-text-secondary">This page doesn&apos;t exist.</p>
      <Link href="/home" className="text-text-link underline-offset-4 hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}
