import type { ReactNode } from "react";

interface BadgeProps {
  variant?: "success" | "warning" | "danger" | "info" | "neutral" | "primary";
  children: ReactNode;
  className?: string;
}

export function Badge({
  variant = "neutral",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span className={`badge badge--${variant} ${className}`}>{children}</span>
  );
}
