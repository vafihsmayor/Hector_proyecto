import React from 'react';
import { TriangleAlert as AlertTriangle, CircleAlert as AlertCircle, Info, CircleCheck as CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AlertCardProps {
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  deviceName: string;
  timestamp: string;
  status?: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
}

export default function AlertCard({
  type,
  priority,
  message,
  deviceName,
  timestamp,
  status = 'active',
}: AlertCardProps) {
  const priorityConfig = {
    low: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: Info,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      text: 'text-blue-800',
    },
    medium: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: AlertCircle,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      text: 'text-yellow-800',
    },
    high: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: AlertTriangle,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      text: 'text-orange-800',
    },
    critical: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: AlertTriangle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      text: 'text-red-800',
    },
  };

  const config = priorityConfig[priority];
  const Icon = config.icon;

  const statusBadge = {
    active: 'bg-green-100 text-green-800',
    acknowledged: 'bg-blue-100 text-blue-800',
    resolved: 'bg-slate-100 text-slate-800',
    dismissed: 'bg-slate-100 text-slate-500',
  };

  return (
    <div className={`${config.bg} border ${config.border} rounded-lg p-4`}>
      <div className="flex items-start gap-3">
        <div className={`${config.iconBg} p-2 rounded-lg flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className={`font-semibold ${config.text}`}>{type}</h4>
            <span className={`text-xs px-2 py-1 rounded ${statusBadge[status]}`}>
              {status === 'active' ? 'Activa' : status === 'acknowledged' ? 'Reconocida' : status === 'resolved' ? 'Resuelta' : 'Descartada'}
            </span>
          </div>

          <p className="text-sm text-slate-700 mb-2">{message}</p>

          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-medium">{deviceName}</span>
            <span>{format(new Date(timestamp), 'dd/MM/yyyy HH:mm', { locale: es })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
