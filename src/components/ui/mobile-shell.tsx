import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface MobileShellProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export const MobileShell = ({ children, className, contentClassName }: MobileShellProps) => (
  <div
    className={cn(
      "relative mx-auto flex min-h-screen w-full max-w-[428px] flex-col bg-[var(--color-background)] px-0 pb-[calc(var(--safe-bottom,0px)+1.5rem)] pt-[var(--safe-top,0px)] sm:max-w-[480px]",
      className,
    )}
  >
    <div className={cn("flex flex-1 flex-col gap-8 px-5", contentClassName)}>{children}</div>
  </div>
);
