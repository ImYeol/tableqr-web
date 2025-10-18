import * as React from "react";

const iconProps: Pick<
  React.SVGProps<SVGSVGElement>,
  "fill" | "stroke" | "strokeWidth" | "strokeLinecap" | "strokeLinejoin"
> = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const createIcon = (path: React.ReactNode) =>
  React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(({ className, ...props }, ref) => (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...iconProps}
      {...props}
    >
      {path}
    </svg>
  ));

export const SearchIcon = createIcon(
  <>
    <circle cx={11} cy={11} r={6} />
    <path d="m20 20-3.35-3.35" />
  </>,
);
SearchIcon.displayName = "SearchIcon";

export const SlidersIcon = createIcon(
  <>
    <path d="M4 21v-7" />
    <path d="M4 10V3" />
    <path d="M12 21v-9" />
    <path d="M12 8V3" />
    <path d="M20 21v-5" />
    <path d="M20 12V3" />
    <path d="M1 14h6" />
    <path d="M9 8h6" />
    <path d="M17 16h6" />
  </>,
);
SlidersIcon.displayName = "SlidersIcon";

export const HeartIcon = createIcon(
  <path d="M19.5 12.572 12 20l-7.5-7.428a4.5 4.5 0 0 1 6.221-6.5L12 7.5l1.279-1.356a4.5 4.5 0 0 1 6.221 6.428Z" />,
);
HeartIcon.displayName = "HeartIcon";

export const HeartFillIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
  ({ className, ...props }, ref) => (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
      {...props}
    >
      <path d="M4.21 4.225a4.5 4.5 0 0 1 6.369.063l1.421 1.518 1.42-1.518a4.5 4.5 0 1 1 6.432 6.292L12 20.25 4.147 10.55a4.5 4.5 0 0 1 .063-6.326Z" />
    </svg>
  ),
);
HeartFillIcon.displayName = "HeartFillIcon";

export const ArrowRightIcon = createIcon(
  <>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </>,
);
ArrowRightIcon.displayName = "ArrowRightIcon";

export const ArrowLeftIcon = createIcon(
  <>
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </>,
);
ArrowLeftIcon.displayName = "ArrowLeftIcon";

export const CloseIcon = createIcon(
  <>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </>,
);
CloseIcon.displayName = "CloseIcon";

export const ClockIcon = createIcon(
  <>
    <circle cx={12} cy={12} r={8} />
    <path d="M12 8v4l2.5 1.5" />
  </>,
);
ClockIcon.displayName = "ClockIcon";

export const ShareIcon = createIcon(
  <>
    <circle cx={18} cy={5} r={3} />
    <circle cx={6} cy={12} r={3} />
    <circle cx={18} cy={19} r={3} />
    <path d="M15.59 6.51 8.42 10.98" />
    <path d="m8.41 13.02 7.18 4.47" />
  </>,
);
ShareIcon.displayName = "ShareIcon";

export const MessageIcon = createIcon(
  <>
    <path d="M21 11.5a7.5 7.5 0 0 1-9 7.35L7 21l1.2-4A7.5 7.5 0 1 1 21 11.5Z" />
    <path d="M9 10h6" />
    <path d="M9 13h3" />
  </>,
);
MessageIcon.displayName = "MessageIcon";

export const PhoneIcon = createIcon(
  <>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.15 9.8 19.79 19.79 0 0 1 .08 1.86 2 2 0 0 1 2.06 0h3a2 2 0 0 1 2 1.72 12.42 12.42 0 0 0 .67 2.73 2 2 0 0 1-.45 2.11L6 7a16 16 0 0 0 11 11l.44-.28a2 2 0 0 1 2.11-.45 12.42 12.42 0 0 0 2.73.67A2 2 0 0 1 22 16.92Z" />
  </>,
);
PhoneIcon.displayName = "PhoneIcon";

export const ShoppingBagIcon = createIcon(
  <>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </>,
);
ShoppingBagIcon.displayName = "ShoppingBagIcon";

export const StarIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
  ({ className, ...props }, ref) => (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
      stroke="none"
      {...props}
    >
      <path d="M12 3.25 14.63 8a1 1 0 0 0 .75.5l5.12.74-3.7 3.62a1 1 0 0 0-.29.9l.87 5.09-4.57-2.4a1 1 0 0 0-.94 0l-4.57 2.4.87-5.09a1 1 0 0 0-.29-.9L3.5 9.24 8.62 8.5a1 1 0 0 0 .75-.5Z" />
    </svg>
  ),
);
StarIcon.displayName = "StarIcon";
