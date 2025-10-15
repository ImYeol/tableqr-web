import { StarIcon } from "@/components/ui/icons";

interface RatingBadgeProps {
  value: number;
  count?: number;
}

export const RatingBadge = ({ value, count }: RatingBadgeProps) => (
  <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-brand-600/10 px-3 py-1 text-xs font-semibold text-brand-700">
    <StarIcon className="h-3.5 w-3.5 text-[var(--color-accent-amber)]" />
    <span>{value.toFixed(1)}</span>
    {typeof count === "number" ? <span className="text-[0.75rem] font-medium text-muted-foreground/80">({count})</span> : null}
  </span>
);
