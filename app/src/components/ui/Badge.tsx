type BadgeVariant = "active" | "ended" | "archived" | "agent" | "default";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  active: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  ended: "bg-slate-600/40 text-gray-400 border border-slate-600/40",
  archived: "bg-red-500/20 text-red-400 border border-red-500/30",
  agent: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30",
  default: "bg-slate-700/50 text-gray-400 border border-slate-600/40",
};

export function Badge({ variant = "default", children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
}
