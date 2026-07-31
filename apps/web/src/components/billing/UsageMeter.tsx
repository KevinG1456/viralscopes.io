import { Progress } from '../ui/progress';

// Null limit = no ceiling (Enterprise, or a limit this plan doesn't cap at
// all -- e.g. exportsPerMonth: 0 on Free is a real zero, not "unlimited").
// Warning/error thresholds are a frontend display choice only -- the
// backend's own quota-enforcement code (Phase 5) is the actual gate; this
// never blocks anything itself (Architecture Rules: "frontend never
// determines subscription state").
export function UsageMeter({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number | null;
}): React.ReactElement {
  if (limit === null) {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">{label}</span>
          <span className="text-text-primary">{used.toLocaleString()} · Unlimited</span>
        </div>
      </div>
    );
  }

  const percent = limit === 0 ? 100 : (used / limit) * 100;
  const variant = percent >= 100 ? 'error' : percent >= 80 ? 'warning' : 'default';

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-secondary">{label}</span>
        <span className="text-text-primary">
          {used.toLocaleString()} / {limit.toLocaleString()}
        </span>
      </div>
      <Progress value={percent} variant={variant} label={`${label} usage`} />
      {percent >= 100 ? (
        <span className="text-xs text-error">Limit reached for this period.</span>
      ) : percent >= 80 ? (
        <span className="text-xs text-warning">Approaching your plan limit.</span>
      ) : null}
    </div>
  );
}
