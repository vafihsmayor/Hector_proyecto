import React from 'react';
import { Video, TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  status?: 'success' | 'warning' | 'danger' | 'info';
  subtitle?: string;
}

export default function KPICard({
  title,
  value,
  icon: Icon,
  change,
  trend = 'stable',
  status = 'info',
  subtitle,
}: KPICardProps) {
  const statusColors = {
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    danger: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  };

  const iconColors = {
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    danger: 'bg-red-100 text-red-600',
    info: 'bg-blue-100 text-blue-600',
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    stable: 'text-slate-600',
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div className={`bg-white border ${statusColors[status]} rounded-lg p-6 shadow-sm`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mb-2">{value}</p>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-sm mt-2 ${trendColors[trend]}`}>
              <TrendIcon className="w-4 h-4" />
              <span className="font-semibold">{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        <div className={`${iconColors[status]} p-3 rounded-lg`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
