import React from 'react';

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'disconnected' | 'maintenance';
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const statusConfig = {
    active: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      label: 'Activo',
      dot: 'bg-green-500',
    },
    inactive: {
      bg: 'bg-slate-100',
      text: 'text-slate-800',
      label: 'Inactivo',
      dot: 'bg-slate-500',
    },
    disconnected: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      label: 'Desconectado',
      dot: 'bg-red-500',
    },
    maintenance: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      label: 'Mantenimiento',
      dot: 'bg-yellow-500',
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
