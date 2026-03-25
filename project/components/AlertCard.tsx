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
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      icon: Info,
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      text: 'text-blue-400',
    },
    medium: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      icon: AlertCircle,
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-400',
      text: 'text-amber-400',
    },
    high: {
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
      icon: AlertTriangle,
      iconBg: 'bg-orange-500/20',
      iconColor: 'text-orange-400',
      text: 'text-orange-400',
    },
    critical: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      icon: AlertTriangle,
      iconBg: 'bg-rose-500/20',
      iconColor: 'text-rose-400',
      text: 'text-rose-400',
    },
  };

  const config = priorityConfig[priority];
  const Icon = config.icon;

  const statusBadge = {
    active: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20',
    acknowledged: 'bg-blue-500/20 text-blue-400 border border-blue-500/20',
    resolved: 'bg-slate-500/20 text-slate-400 border border-slate-500/20',
    dismissed: 'bg-slate-500/10 text-slate-500 border border-white/5',
  };

  return (
    <div className={`${config.bg} border ${config.border} rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:bg-white/5`}>
      <div className="flex items-start gap-4">
        <div className={`${config.iconBg} p-2.5 rounded-xl flex-shrink-0 shadow-inner`}>
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className={`font-bold tracking-tight ${config.text}`}>{type}</h4>
            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${statusBadge[status]}`}>
              {status === 'active' ? 'Activa' : status === 'acknowledged' ? 'Reconocida' : status === 'resolved' ? 'Resuelta' : 'Descartada'}
            </span>
          </div>

          <p className="text-sm text-slate-300 mb-3 leading-relaxed">{message}</p>

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            <span className="font-medium">{deviceName}</span>
            <span>{format(new Date(timestamp), 'dd/MM/yyyy HH:mm', { locale: es })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
