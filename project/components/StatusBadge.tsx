import React from 'react';

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'disconnected' | 'maintenance';
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const statusConfig = {
    active: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      label: 'Activo',
      dot: 'bg-emerald-500',
    },
    inactive: {
      bg: 'bg-slate-500/10',
      text: 'text-slate-400',
      label: 'Inactivo',
      dot: 'bg-slate-500',
    },
    disconnected: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      label: 'Desconectado',
      dot: 'bg-rose-500',
    },
    maintenance: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      label: 'Mantenimiento',
      dot: 'bg-amber-500',
    },
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${config.bg} ${config.text} ${sizeClasses[size]} font-medium rounded-full`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      {config.label}
    </span>
  );
}
