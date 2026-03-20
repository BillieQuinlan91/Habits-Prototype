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
        "inline-flex h-12 items-center justify-center rounded-xl px-4 text-[15px] font-medium transition duration-200",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "bg-accent text-white shadow-soft hover:translate-y-[-1px] hover:bg-accent/95",
        variant === "secondary" &&
          "border border-border bg-card text-foreground hover:bg-surface/70",
        variant === "ghost" && "text-foreground/72 hover:bg-surface/70 hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
});
