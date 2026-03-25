'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import AlertCard from '@/components/AlertCard';
import DataTable from '@/components/DataTable';
import { ListFilter as Filter, CircleCheck as CheckCircle, Circle as XCircle } from 'lucide-react';
import { getAlerts, updateAlertStatus } from '@/lib/api';
import { useBeacons } from '@/lib/useBeacons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AlertsPage() {
  const { beacons, error: beaconError } = useBeacons();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const beaconById = useMemo(() => {
    const map = new Map<string, string>();
    beacons.forEach((beacon) => map.set(beacon.id, beacon.name));
    return map;
  }, [beacons]);

  const fetchAlerts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAlerts(priorityFilter, statusFilter);
      setAlerts(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las alertas');
    } finally {
      setIsLoading(false);
    }
  }, [priorityFilter, statusFilter]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const activeAlerts = alerts.filter((a) => a.status === 'active').length;
  const criticalAlerts = alerts.filter(
    (a) => a.status === 'active' && a.priority === 'critical'
  ).length;
  const acknowledgedAlerts = alerts.filter((a) => a.status === 'acknowledged').length;
  const resolvedAlerts = alerts.filter((a) => a.status === 'resolved').length;

  const handleAcknowledge = async (alertId: string) => {
    try {
      await updateAlertStatus(alertId, 'acknowledge');
      fetchAlerts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleResolve = async (alertId: string) => {
    try {
      await updateAlertStatus(alertId, 'resolve');
      fetchAlerts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const columns = [
    {
      key: 'priority',
      label: 'Prioridad',
      render: (value: string) => (
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
            value === 'critical'
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              : value === 'high'
              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
              : value === 'medium'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
          }`}
        >
          {value === 'critical'
            ? 'Crítica'
            : value === 'high'
            ? 'Alta'
            : value === 'medium'
            ? 'Media'
            : 'Baja'}
        </span>
      ),
    },
    {
      key: 'type',
      label: 'Tipo',
      render: (value: string) => <span className="font-bold text-white mb-0.5 block">{value}</span>,
    },
    {
      key: 'message',
      label: 'Mensaje',
      render: (value: string) => <span className="text-slate-400 text-xs leading-relaxed">{value}</span>,
    },
    {
      key: 'beacon_id',
      label: 'Dispositivo',
      render: (value: string) => {
        return <span className="text-xs font-bold text-slate-300">{beaconById.get(value) || 'Desconocido'}</span>;
      },
    },
    {
      key: 'status',
      label: 'Estado',
      render: (value: string) => (
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
            value === 'active'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : value === 'acknowledged'
              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
              : value === 'resolved'
              ? 'bg-slate-500/10 text-slate-400 border border-white/5'
              : 'bg-white/5 text-slate-500'
          }`}
        >
          {value === 'active'
            ? 'Activa'
            : value === 'acknowledged'
            ? 'Reconocida'
            : value === 'resolved'
            ? 'Resuelta'
            : 'Descartada'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Fecha',
      render: (value: string) => (
        <span className="text-xs font-bold text-slate-500 tabular-nums">
          {format(new Date(value), 'dd/MM/yyyy HH:mm', { locale: es })}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (_: any, row: any) => (
        <div className="flex items-center gap-2">
          {row.status === 'active' && (
            <button
              onClick={() => handleAcknowledge(row.id)}
              className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all"
              title="Reconocer"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          {(row.status === 'active' || row.status === 'acknowledged') && (
            <button
              onClick={() => handleResolve(row.id)}
              className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all"
              title="Resolver"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#020617]">
      <Navbar />
      <div>
        <main className="pt-20 p-6 max-w-[1600px] mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Sistema de Alertas</h1>
            <p className="text-slate-400 font-medium">
              Monitoreo y gestión de alertas generadas por los dispositivos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-900 border border-emerald-500/20 rounded-xl p-5 shadow-xl relative overflow-hidden group">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60 mb-2">Alertas Activas</p>
              <p className="text-3xl font-black text-emerald-400 relative z-10">{activeAlerts}</p>
              <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-emerald-500 blur-3xl opacity-5 group-hover:opacity-10 transition-opacity"></div>
            </div>
            <div className="bg-slate-900 border border-rose-500/20 rounded-xl p-5 shadow-xl relative overflow-hidden group">
              <p className="text-[10px] font-black uppercase tracking-widest text-rose-500/60 mb-2">Críticas</p>
              <p className="text-3xl font-black text-rose-400 relative z-10">{criticalAlerts}</p>
              <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-rose-500 blur-3xl opacity-5 group-hover:opacity-10 transition-opacity"></div>
            </div>
            <div className="bg-slate-900 border border-blue-500/20 rounded-xl p-5 shadow-xl relative overflow-hidden group">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-500/60 mb-2">Reconocidas</p>
              <p className="text-3xl font-black text-blue-400 relative z-10">{acknowledgedAlerts}</p>
              <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-blue-500 blur-3xl opacity-5 group-hover:opacity-10 transition-opacity"></div>
            </div>
            <div className="bg-slate-900 border border-white/10 rounded-xl p-5 shadow-xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Resueltas</p>
              <p className="text-3xl font-black text-slate-300">{resolvedAlerts}</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-400" />
                Filtros de Búsqueda
              </h3>
              <div className="flex gap-2 bg-black/40 p-1.5 rounded-xl border border-white/5 shadow-inner">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                    viewMode === 'cards'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Tarjetas
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                    viewMode === 'table'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Tabla
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Prioridad</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                >
                  <option value="all" className="bg-slate-900">Todas las prioridades</option>
                  <option value="critical" className="bg-slate-900">Crítica</option>
                  <option value="high" className="bg-slate-900">Alta</option>
                  <option value="medium" className="bg-slate-900">Media</option>
                  <option value="low" className="bg-slate-900">Baja</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Estado</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                >
                  <option value="all" className="bg-slate-900">Todos los estados</option>
                  <option value="active" className="bg-slate-900">Activas</option>
                  <option value="acknowledged" className="bg-slate-900">Reconocidas</option>
                  <option value="resolved" className="bg-slate-900">Resueltas</option>
                  <option value="dismissed" className="bg-slate-900">Descartadas</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 bg-slate-900 border border-white/10 rounded-xl shadow-2xl">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6 shadow-[0_0_15px_rgba(59,130,246,0.3)]"></div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Cargando alertas...</p>
            </div>
          ) : viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alerts.map((alert) => {
                return (
                  <AlertCard
                    key={alert.id}
                    type={alert.type}
                    priority={alert.priority}
                    message={alert.message}
                    deviceName={beaconById.get(alert.beacon) || 'Dispositivo desconocido'}
                    timestamp={alert.created_at}
                    status={alert.status}
                  />
                );
              })}
              {alerts.length === 0 && (
                <div className="col-span-full py-24 text-center bg-white/5 border border-dashed border-white/10 rounded-2xl">
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No se encontraron alertas para este filtro</p>
                </div>
              )}
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={alerts}
              emptyMessage="No se encontraron alertas que coincidan con los filtros"
            />
          )}
        </main>
      </div>
    </div>
  );
}
