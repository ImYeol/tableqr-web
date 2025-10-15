import * as React from "react";

import { cn } from "@/lib/utils";

type IconButtonVariant = "primary" | "soft" | "ghost";
type IconButtonSize = "xs" | "sm" | "md";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
}

const baseStyle =
  "inline-flex items-center justify-center rounded-full transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-60";

const sizeStyles: Record<IconButtonSize, string> = {
  xs: "h-8 w-8 text-sm",
  sm: "h-10 w-10 text-base",
  md: "h-12 w-12 text-lg",
};

const variantStyles: Record<IconButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white shadow-[0_18px_32px_-26px_rgba(33,94,59,0.55)] hover:bg-brand-700 hover:shadow-[0_22px_38px_-24px_rgba(33,94,59,0.6)]",
  soft: "bg-white/90 text-brand-600 border border-border-soft hover:bg-white shadow-[0_15px_28px_-26px_rgba(15,49,33,0.32)]",
  ghost:
    "bg-white/70 text-foreground/90 border border-transparent hover:bg-white/90 hover:text-foreground shadow-[0_12px_24px_-20px_rgba(31,41,35,0.35)]",
};

export const iconButtonClassName = ({
  variant = "soft",
  size = "md",
  className,
}: {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  className?: string;
}) => cn(baseStyle, sizeStyles[size], variantStyles[variant], className);

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = "soft", size = "md", type = "button", ...props }, ref) => (
    <button ref={ref} type={type} className={iconButtonClassName({ variant, size, className })} {...props} />
  ),
);
IconButton.displayName = "IconButton";
