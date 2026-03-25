'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
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
          className={`px-2 py-1 rounded text-xs font-semibold ${
            value === 'critical'
              ? 'bg-red-100 text-red-700'
              : value === 'high'
              ? 'bg-orange-100 text-orange-700'
              : value === 'medium'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-blue-100 text-blue-700'
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
      render: (value: string) => <span className="font-medium text-slate-900">{value}</span>,
    },
    {
      key: 'message',
      label: 'Mensaje',
    },
    {
      key: 'beacon_id',
      label: 'Dispositivo',
      render: (value: string) => {
        return <span className="text-sm text-slate-700">{beaconById.get(value) || 'Desconocido'}</span>;
      },
    },
    {
      key: 'status',
      label: 'Estado',
      render: (value: string) => (
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${
            value === 'active'
              ? 'bg-green-100 text-green-700'
              : value === 'acknowledged'
              ? 'bg-blue-100 text-blue-700'
              : value === 'resolved'
              ? 'bg-slate-100 text-slate-700'
              : 'bg-slate-100 text-slate-500'
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
        <span className="text-sm text-slate-600">
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
              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Reconocer"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          {(row.status === 'active' || row.status === 'acknowledged') && (
            <button
              onClick={() => handleResolve(row.id)}
              className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
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
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="pt-16 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Sistema de Alertas</h1>
            <p className="text-slate-600">
              Monitoreo y gestión de alertas generadas por los dispositivos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-green-200 rounded-lg p-4 bg-green-50">
              <p className="text-sm text-green-700 mb-1">Alertas Activas</p>
              <p className="text-2xl font-bold text-green-700">{activeAlerts}</p>
            </div>
            <div className="bg-white border border-red-200 rounded-lg p-4 bg-red-50">
              <p className="text-sm text-red-700 mb-1">Críticas</p>
              <p className="text-2xl font-bold text-red-700">{criticalAlerts}</p>
            </div>
            <div className="bg-white border border-blue-200 rounded-lg p-4 bg-blue-50">
              <p className="text-sm text-blue-700 mb-1">Reconocidas</p>
              <p className="text-2xl font-bold text-blue-700">{acknowledgedAlerts}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-4 bg-slate-50">
              <p className="text-sm text-slate-700 mb-1">Resueltas</p>
              <p className="text-2xl font-bold text-slate-700">{resolvedAlerts}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtros
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    viewMode === 'cards'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Tarjetas
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    viewMode === 'table'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Tabla
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Prioridad</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todas las prioridades</option>
                  <option value="critical">Crítica</option>
                  <option value="high">Alta</option>
                  <option value="medium">Media</option>
                  <option value="low">Baja</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Estado</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Activas</option>
                  <option value="acknowledged">Reconocidas</option>
                  <option value="resolved">Resueltas</option>
                  <option value="dismissed">Descartadas</option>
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
            <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-600">Cargando alertas...</p>
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
                <div className="col-span-full py-20 text-center bg-white border border-dashed border-slate-300 rounded-xl">
                  <p className="text-slate-500">No se encontraron alertas para este filtro.</p>
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
