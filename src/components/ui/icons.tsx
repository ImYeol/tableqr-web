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

export const ClockIcon = createIcon(
  <>
    <circle cx={12} cy={12} r={8} />
    <path d="M12 8v4l2.5 1.5" />
  </>,
);
ClockIcon.displayName = "ClockIcon";
