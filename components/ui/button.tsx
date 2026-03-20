import { ButtonHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex h-12 items-center justify-center rounded-full px-5 text-sm font-semibold tracking-wide transition duration-200",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "bg-foreground text-surface shadow-premium hover:translate-y-[-1px]",
        variant === "secondary" &&
          "border border-border bg-card/80 text-foreground hover:bg-card",
        variant === "ghost" && "text-foreground/72 hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
});
