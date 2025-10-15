import Link from "next/link";
import type { ReactNode } from "react";

import { buttonClassName } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MobileActionBarProps {
  totalLabel: string;
  totalValue: string;
  actionLabel: string;
  href: string;
  className?: string;
  totalIcon?: ReactNode;
}

export const MobileActionBar = ({
  totalLabel,
  totalValue,
  actionLabel,
  href,
  className,
  totalIcon,
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
        <div className="mt-1 flex items-center gap-2">
          {totalIcon ? <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600/10 text-brand-700">{totalIcon}</span> : null}
          <span className="text-lg font-semibold text-foreground">{totalValue}</span>
        </div>
      </div>
      <Link href={href} className={buttonClassName({ variant: "primary", size: "md", className: "px-6 shadow-none" })}>
        {actionLabel}
      </Link>
    </div>
  </div>
);
