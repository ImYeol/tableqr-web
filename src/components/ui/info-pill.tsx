import type { PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

type InfoPillVariant = "brand" | "muted" | "surface";

interface InfoPillProps extends PropsWithChildren {
  variant?: InfoPillVariant;
  className?: string;
}

const variantStyle: Record<InfoPillVariant, string> = {
  brand: "bg-brand-600/10 text-brand-700",
  muted: "bg-surface-muted text-muted-foreground",
  surface: "bg-white/80 text-foreground",
};

export const InfoPill = ({ variant = "brand", className, children }: InfoPillProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded-[var(--radius-pill)] px-3 py-1 text-[0.75rem] font-semibold uppercase tracking-[0.28em]",
      variantStyle[variant],
      className,
    )}
  >
    {children}
  </span>
);
