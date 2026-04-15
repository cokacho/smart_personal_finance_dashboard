import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  variant?: "default" | "glass" | "flat";
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
  style?: React.CSSProperties;
}

export function GlassCard({
  children,
  variant = "default",
  padding = "md",
  className = "",
  style,
}: GlassCardProps) {
  const variantClass =
    variant === "glass"
      ? "card--glass"
      : variant === "flat"
        ? "card--flat"
        : "card";
  const paddingClass = `card-padding-${padding}`;

  return (
    <div
      className={`${variantClass} ${paddingClass} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
