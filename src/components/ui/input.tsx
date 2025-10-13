import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", leftIcon, rightIcon, ...props }, ref) => (
    <label
      className={cn(
        "flex w-full items-center gap-3 rounded-[var(--radius-pill)] border border-border-soft/80 bg-surface px-4 py-3 text-sm shadow-[0_14px_32px_-24px_rgba(31,27,22,0.2)]",
        "focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-200",
        className,
      )}
    >
      {leftIcon ? <span className="text-muted-foreground">{leftIcon}</span> : null}
      <input
        ref={ref}
        type={type}
        className="flex-1 border-0 bg-transparent text-base font-medium text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
        {...props}
      />
      {rightIcon ? <span className="text-muted-foreground">{rightIcon}</span> : null}
    </label>
  ),
);
Input.displayName = "Input";

