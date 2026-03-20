import { SelectHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          "h-12 w-full rounded-2xl border border-border bg-surface/80 px-4 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    );
  },
);
