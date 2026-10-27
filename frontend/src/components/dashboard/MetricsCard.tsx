import { ReactNode } from 'react';

interface MetricsCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  description?: string;
}

export function MetricsCard({ title, value, icon, description }: MetricsCardProps) {
  return (
    <div className="panel p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="chip-label">{title}</p>
          <p className="font-serif text-text-primary mt-1 mb-1" style={{ fontSize: '32px', lineHeight: 1.1 }}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {description && (
            <p className="text-xs text-text-muted">{description}</p>
          )}
        </div>
        <div className="flex-shrink-0 ml-3">
          <div className="w-9 h-9 border border-border rounded-sm flex items-center justify-center text-accent">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}
