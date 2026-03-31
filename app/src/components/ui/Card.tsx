interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = "", hover = false }: CardProps) {
  return (
    <div
      className={`bg-slate-800 border border-slate-700 rounded-lg ${hover ? "transition-colors duration-150 hover:border-slate-600" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
