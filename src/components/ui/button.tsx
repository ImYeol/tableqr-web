import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "soft" | "ghost" | "link";
type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white shadow-[0_18px_36px_-18px_rgba(15,49,33,0.55)] hover:bg-brand-700 hover:shadow-[0_22px_44px_-20px_rgba(15,49,33,0.6)]",
  secondary:
    "bg-white text-brand-700 border border-brand-100 hover:border-brand-200 hover:bg-brand-50/60 hover:text-brand-800",
  soft:
    "bg-brand-600/10 text-brand-700 hover:bg-brand-600/20 hover:text-brand-800",
  ghost: "text-muted-foreground hover:bg-surface-muted/70 hover:text-foreground",
  link: "text-brand-600 hover:text-brand-700 underline-offset-4 hover:underline",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm font-medium",
  lg: "h-12 px-6 text-base font-semibold",
  icon: "h-11 w-11 justify-center",
};

export const buttonClassName = ({
  variant,
  size,
  className,
}: {
  variant: ButtonVariant;
  size: ButtonSize;
  className?: string;
}) =>
  cn(
    "inline-flex items-center gap-2 rounded-[var(--radius-pill)] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-60",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => (
    <button ref={ref} type={type} className={buttonClassName({ variant, size, className })} {...props} />
  ),
);
Button.displayName = "Button";
