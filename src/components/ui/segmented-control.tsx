"use client";

import { useCallback } from "react";

import { cn } from "@/lib/utils";

export interface SegmentedControlOption {
  label: string;
  value: string;
}

interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export const SegmentedControl = ({ options, value, onValueChange, className }: SegmentedControlProps) => {
  const handleSelect = useCallback(
    (next: string) => {
      if (next !== value) {
        onValueChange(next);
      }
    },
    [onValueChange, value],
  );

  return (
    <div
      className={cn(
        "no-scrollbar -mx-1 flex gap-2 overflow-x-auto rounded-[var(--radius-pill)] bg-white/70 p-1.5 shadow-[inset_0_0_0_1px_rgba(15,49,33,0.06)] ring-1 ring-inset ring-white/60 backdrop-blur",
        className,
      )}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleSelect(option.value)}
            className={cn(
              "whitespace-nowrap rounded-[calc(var(--radius-pill)-0.125rem)] px-4 py-2 text-sm font-semibold transition-all",
              isActive
                ? "bg-brand-600 text-white shadow-[0_14px_24px_-18px_rgba(15,49,33,0.45)]"
                : "bg-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
