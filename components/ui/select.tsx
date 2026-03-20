import { SelectHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          "h-11 w-full rounded-[10px] border border-border bg-white px-3.5 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/12",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    );
  },
);
