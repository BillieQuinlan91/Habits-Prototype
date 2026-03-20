import { InputHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "h-11 w-full rounded-[10px] border border-border bg-white px-3.5 text-sm text-foreground outline-none transition placeholder:text-foreground/38 focus:border-accent focus:ring-2 focus:ring-accent/12",
          className,
        )}
        {...props}
      />
    );
  },
);
