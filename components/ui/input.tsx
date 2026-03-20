import { InputHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "h-12 w-full rounded-2xl border border-border bg-surface/80 px-4 text-sm text-foreground outline-none transition placeholder:text-foreground/38 focus:border-accent focus:ring-2 focus:ring-accent/15",
          className,
        )}
        {...props}
      />
    );
  },
);
