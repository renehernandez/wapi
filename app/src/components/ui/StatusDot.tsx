type DotStatus = "active" | "ended" | "archived";

interface StatusDotProps {
  status: DotStatus;
  className?: string;
}

const dotClasses: Record<DotStatus, string> = {
  active: "bg-emerald-500 animate-pulse-dot",
  ended: "bg-gray-500",
  archived: "bg-red-400",
};

export function StatusDot({ status, className = "" }: StatusDotProps) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${dotClasses[status]} ${className}`}
    />
  );
}
