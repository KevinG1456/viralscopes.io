export default function Loading(): React.ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
