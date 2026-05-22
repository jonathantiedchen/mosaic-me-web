import { ReactNode } from 'react';

interface MetricsCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  description?: string;
}

export function MetricsCard({ title, value, icon, description }: MetricsCardProps) {
  return (
    <div className="panel p-6 hover:border-accent/40 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-text-secondary mb-1">{title}</p>
          <p className="text-3xl font-bold text-text-primary mb-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {description && (
            <p className="text-xs text-text-muted">{description}</p>
          )}
        </div>
        <div className="flex-shrink-0 ml-4">
          <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-sm flex items-center justify-center text-accent">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}
