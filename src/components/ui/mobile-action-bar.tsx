import Link from "next/link";
import type { ReactNode } from "react";

import { buttonClassName } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MobileActionBarProps {
  totalLabel: string;
  totalValue: ReactNode;
  actionLabel: string;
  href: string;
  className?: string;
  totalIcon?: ReactNode;
  actionIcon?: ReactNode;
}

export const MobileActionBar = ({
  totalLabel,
  totalValue,
  actionLabel,
  href,
  className,
  totalIcon,
  actionIcon,
}: MobileActionBarProps) => (
  <div
    className={cn(
      "sticky bottom-0 left-0 right-0 z-40 -mx-5 rounded-t-[var(--radius-xl)] border border-transparent bg-[var(--color-surface)] px-5 pb-[calc(var(--safe-bottom,0px)+1rem)] pt-4 shadow-[var(--shadow-floating)] backdrop-blur-md",
      className,
    )}
  >
    <div className="flex items-center justify-between gap-5">
      <div className="flex flex-col">
        <span className="text-[0.75rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          {totalLabel}
        </span>
        <div className="mt-1 flex items-center gap-3">
          <div className="text-2xl font-bold leading-none tracking-tight text-foreground">{totalValue}</div>
        </div>
      </div>
      <Link href={href} className={buttonClassName({ variant: "primary", size: "md", className: "px-6 shadow-none" })}>
        <span className="flex items-center gap-2">
          <span>{actionLabel}</span>
          {actionIcon ? <span className="text-[1.1rem] leading-none">{actionIcon}</span> : null}
        </span>
      </Link>
    </div>
  </div>
);
