interface LoadingSpinnerProps {
  size?: "sm" | "lg";
  label?: string;
}

export function LoadingSpinner({ size = "sm", label }: LoadingSpinnerProps) {
  return (
    <div className="loading-state">
      <div className={`spinner spinner--${size === "lg" ? "lg" : ""}`} />
      {label && <span>{label}</span>}
    </div>
  );
}
