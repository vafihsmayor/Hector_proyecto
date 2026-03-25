'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import StatusBadge from '@/components/StatusBadge';
import ChartCard from '@/components/ChartCard';
import KPICard from '@/components/KPICard';
import { ArrowLeft, Radio, MapPin, Calendar, Battery, Signal, Thermometer, Clock, TriangleAlert as AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { mockAlerts, mockPredictions } from '@/lib/mockData';
import { getBeaconMetrics } from '@/lib/api';
import { useBeacons } from '@/lib/useBeacons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DeviceDetailPage() {
  const params = useParams();
  const beaconId = params.id as string;
  const { beacons } = useBeacons();
  const beacon = beacons.find((b) => b.id === beaconId);

  const [metrics, setMetrics] = useState<any[]>([]);

  const toValidBattery = (value: unknown): number | null => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 && parsed <= 100 ? parsed : null;
  };

  const toValidSignal = (value: unknown): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  useEffect(() => {
    const loadMetrics = async () => {
      if (!beaconId) {
        return;
      }

      try {
        const beaconMetrics = await getBeaconMetrics(beaconId, 30);
        const orderedAsc = [...beaconMetrics].reverse();
        setMetrics(
          orderedAsc.map((item) => ({
            ...item,
            battery_level: toValidBattery(item.battery_level),
            signal_strength: toValidSignal(item.signal_strength),
            temperature: 25,
            usage_time: 0,
          }))
        );
      } catch {
        setMetrics([]);
      }
    };

    loadMetrics();
    const intervalId = window.setInterval(loadMetrics, 15000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [beaconId]);

  if (!beacon) {
    return (
      <div className="min-h-screen bg-[#020617]">
        <Navbar />
        <div>
          <main className="pt-20 p-6 max-w-[1600px] mx-auto">
            <div className="bg-slate-900 border border-dashed border-white/10 rounded-2xl p-20 text-center shadow-inner">
              <Radio className="w-20 h-20 text-slate-700 mx-auto mb-6 animate-pulse" />
              <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Dispositivo no encontrado</p>
              <Link
                href="/devices"
                className="inline-block mt-8 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all active:scale-95"
              >
                Volver al listado
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const latestMetric = metrics[metrics.length - 1];
  const deviceAlerts = mockAlerts.filter((a) => a.beacon_id === beaconId);
  const devicePrediction = mockPredictions.find((p) => p.beacon_id === beaconId);

  const batteryChartData = metrics.map((m) => ({
    date: format(new Date(m.timestamp), 'dd/MM HH:mm', { locale: es }),
    battery: m.battery_level,
  }));

  const signalChartData = metrics.map((m) => ({
    date: format(new Date(m.timestamp), 'dd/MM HH:mm', { locale: es }),
    signal: m.signal_strength,
  }));

  return (
    <div className="min-h-screen bg-[#020617]">
      <Navbar />
      <div>
        <main className="pt-20 p-6 max-w-[1600px] mx-auto">
          <div className="mb-8">
            <Link
              href="/devices"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6 font-bold text-xs uppercase tracking-widest transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a dispositivos
            </Link>
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-4xl font-black text-white mb-2 tracking-tight">{beacon.name}</h1>
                <p className="text-slate-500 font-mono text-sm tracking-wider">{beacon.device_id}</p>
              </div>
              <StatusBadge status={beacon.status} size="lg" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-xl hover:border-blue-500/30 transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ubicación</p>
              </div>
              <p className="text-base font-bold text-white">{beacon.location}</p>
            </div>

            <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-xl hover:border-blue-500/30 transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <Radio className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Modelo</p>
              </div>
              <p className="text-base font-bold text-white">{beacon.model}</p>
            </div>

            <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-xl hover:border-blue-500/30 transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Fecha de Registro</p>
              </div>
              <p className="text-base font-bold text-white tabular-nums">
                {beacon.enrolled_at
                  ? format(new Date(beacon.enrolled_at), 'dd/MM/yyyy', { locale: es })
                  : 'N/A'}
              </p>
            </div>

            <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-xl hover:border-blue-500/30 transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Última Conexión</p>
              </div>
              <p className="text-base font-bold text-white tabular-nums">
                {beacon.last_seen
                  ? format(new Date(beacon.last_seen), 'dd/MM/yyyy HH:mm', { locale: es })
                  : 'N/A'}
              </p>
            </div>
          </div>

          {latestMetric && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <KPICard
                title="Nivel de Batería"
                value={
                  latestMetric.battery_level === null
                    ? 'N/D'
                    : `${latestMetric.battery_level.toFixed(1)}%`
                }
                icon={Battery}
                status={
                  latestMetric.battery_level === null
                    ? 'info'
                    : latestMetric.battery_level > 50
                    ? 'success'
                    : latestMetric.battery_level > 20
                    ? 'warning'
                    : 'danger'
                }
                subtitle={latestMetric.battery_level === null ? 'Sin lectura GATT' : undefined}
              />

              <KPICard
                title="Intensidad de Señal"
                value={`${latestMetric.signal_strength.toFixed(0)} dBm`}
                icon={Signal}
                status="info"
                subtitle="RSSI"
              />

              <KPICard
                title="Temperatura"
                value={`${latestMetric.temperature.toFixed(1)}°C`}
                icon={Thermometer}
                status={latestMetric.temperature > 35 ? 'warning' : 'success'}
              />

              <KPICard
                title="Tiempo de Uso"
                value={`${(latestMetric.usage_time / 24).toFixed(0)} días`}
                icon={Clock}
                status="info"
                subtitle={`${latestMetric.usage_time.toFixed(0)} horas`}
              />
            </div>
          )}

          {devicePrediction && (
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 mb-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <h3 className="text-lg font-bold text-white mb-8 uppercase tracking-wider flex items-center gap-2 relative z-10">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Predicción de Mantenimiento Inteligente
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Probabilidad de Falla</p>
                  <div className="flex items-end gap-3">
                    <p className="text-4xl font-black text-white tabular-nums">
                      {devicePrediction.failure_probability}%
                    </p>
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-1 ${
                        devicePrediction.risk_level === 'critical'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : devicePrediction.risk_level === 'high'
                          ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                          : devicePrediction.risk_level === 'medium'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {devicePrediction.risk_level === 'critical'
                        ? 'Crítico'
                        : devicePrediction.risk_level === 'high'
                        ? 'Alto'
                        : devicePrediction.risk_level === 'medium'
                        ? 'Medio'
                        : 'Bajo'}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Tiempo Estimado</p>
                  <p className="text-4xl font-black text-white tabular-nums">
                    {devicePrediction.estimated_time_to_fail > 0
                      ? `${devicePrediction.estimated_time_to_fail}h`
                      : 'Inmediata'}
                  </p>
                </div>

                <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Recomendación</p>
                  <p className="text-lg font-bold text-white leading-tight">
                    {devicePrediction.maintenance_recommended
                      ? 'Mantenimiento requerido pronto'
                      : 'Dispositivo en estado normal'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-2 font-black uppercase tracking-widest">
                    Confianza: {(devicePrediction.confidence_score * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ChartCard
              title="Historial de Batería (30 días)"
              data={batteryChartData}
              type="line"
              dataKey="battery"
              xAxisKey="date"
              color="#10b981"
              height={300}
            />

            <ChartCard
              title="Historial de Señal RSSI (30 días)"
              data={signalChartData}
              type="area"
              dataKey="signal"
              xAxisKey="date"
              color="#3b82f6"
              height={300}
            />
          </div>

          {deviceAlerts.length > 0 && (
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-8 uppercase tracking-wider">
                Historial de Alertas Locales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deviceAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="bg-black/40 border border-white/5 rounded-2xl p-5 flex items-start justify-between group hover:border-blue-500/30 transition-all"
                  >
                    <div>
                      <p className="font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{alert.type}</p>
                      <p className="text-xs text-slate-500 mb-4 leading-relaxed line-clamp-2">{alert.message}</p>
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest tabular-nums">
                        {format(new Date(alert.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                        alert.priority === 'critical'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : alert.priority === 'high'
                          ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                          : alert.priority === 'medium'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}
                    >
                      {alert.priority === 'critical'
                        ? 'Crítica'
                        : alert.priority === 'high'
                        ? 'Alta'
                        : alert.priority === 'medium'
                        ? 'Media'
                        : 'Baja'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
