import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <Image src="/logo.svg" alt="ViralScopes" width={64} height={64} priority />
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">ViralScopes.io</h1>
        <p className="max-w-md text-base text-muted">
          Foundation phase — the monorepo, tooling, and design system are in place. The dashboard
          itself is built in Phase 8.
        </p>
      </div>
    </div>
  );
}
