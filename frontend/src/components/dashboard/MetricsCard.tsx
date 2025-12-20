import { ReactNode } from 'react';

interface MetricsCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  description?: string;
}

export function MetricsCard({ title, value, icon, description }: MetricsCardProps) {
  return (
    <div className="glass-card p-6 hover:bg-white/10 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-purple-300 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white mb-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {description && (
            <p className="text-xs text-purple-200/70">{description}</p>
          )}
        </div>
        <div className="flex-shrink-0 ml-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center text-purple-300">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}
