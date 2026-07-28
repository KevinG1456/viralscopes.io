import { cn } from '../../lib/utils/cn';

function initialsFrom(label: string): string {
  const trimmed = label.trim();
  if (!trimmed) return '?';
  const parts = trimmed.split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

export function Avatar({
  label,
  className,
}: {
  label: string;
  className?: string;
}): React.ReactElement {
  return (
    <span
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-xs font-semibold text-primary',
        className,
      )}
    >
      {initialsFrom(label)}
    </span>
  );
}
