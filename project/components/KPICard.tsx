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
    up: 'text-emerald-400',
    down: 'text-rose-400',
    stable: 'text-slate-500',
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div className="bg-slate-900 border border-white/10 rounded-xl p-6 shadow-xl relative overflow-hidden group">
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-400 mb-1 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-black text-white mb-2">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-sm mt-3 ${trendColors[trend]}`}>
              <TrendIcon className="w-4 h-4" />
              <span className="font-bold">{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-300">
          <Icon className={`w-6 h-6 ${isActiveIconColor(status)}`} />
        </div>
      </div>
      {/* Background glow effect */}
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 blur-3xl opacity-10 rounded-full ${bgGlowColors[status]}`}></div>
    </div>
  );
}

const isActiveIconColor = (status: string) => {
  switch (status) {
    case 'success': return 'text-emerald-400';
    case 'warning': return 'text-amber-400';
    case 'danger': return 'text-rose-400';
    default: return 'text-blue-400';
  }
};

const bgGlowColors = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  info: 'bg-blue-500',
};
