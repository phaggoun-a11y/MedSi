interface Props {
  label: string;
  value: number;
  inverted?: boolean; // higher = worse
}

export function StatBar({ label, value, inverted }: Props) {
  const v = Math.max(0, Math.min(100, value));
  const good = inverted ? v < 25 : v > 70;
  const bad = inverted ? v > 65 : v < 35;
  const color = bad
    ? "var(--crisis)"
    : good
      ? "var(--health)"
      : "var(--warning)";
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-[10px] uppercase tracking-[0.15em]">
        <span className="text-muted-foreground">{label}</span>
        <span style={{ color }} className="font-semibold tabular-nums">
          {v.toFixed(0)}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary/60">
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{ width: `${v}%`, background: color, boxShadow: `0 0 8px ${color}` }}
        />
      </div>
    </div>
  );
}