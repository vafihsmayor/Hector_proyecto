'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
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
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        <div className="ml-64">
          <Header />
          <main className="pt-16 p-6">
            <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
              <p className="text-slate-600">Dispositivo no encontrado</p>
              <Link
                href="/devices"
                className="inline-block mt-4 text-blue-600 hover:text-blue-700"
              >
                Volver a dispositivos
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
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="pt-16 p-6">
          <div className="mb-6">
            <Link
              href="/devices"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a dispositivos
            </Link>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">{beacon.name}</h1>
                <p className="text-slate-600 font-mono text-sm">{beacon.device_id}</p>
              </div>
              <StatusBadge status={beacon.status} size="lg" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="w-5 h-5 text-slate-600" />
                <p className="text-sm font-medium text-slate-600">Ubicación</p>
              </div>
              <p className="text-base font-semibold text-slate-900">{beacon.location}</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Radio className="w-5 h-5 text-slate-600" />
                <p className="text-sm font-medium text-slate-600">Modelo</p>
              </div>
              <p className="text-base font-semibold text-slate-900">{beacon.model}</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-slate-600" />
                <p className="text-sm font-medium text-slate-600">Fecha de Registro</p>
              </div>
              <p className="text-base font-semibold text-slate-900">
                {beacon.enrolled_at
                  ? format(new Date(beacon.enrolled_at), 'dd/MM/yyyy', { locale: es })
                  : 'N/A'}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-slate-600" />
                <p className="text-sm font-medium text-slate-600">Última Conexión</p>
              </div>
              <p className="text-base font-semibold text-slate-900">
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
            <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Predicción de Mantenimiento
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-slate-600 mb-2">Probabilidad de Falla</p>
                  <div className="flex items-end gap-2">
                    <p className="text-3xl font-bold text-slate-900">
                      {devicePrediction.failure_probability}%
                    </p>
                    <span
                      className={`text-sm font-semibold px-2 py-1 rounded ${
                        devicePrediction.risk_level === 'critical'
                          ? 'bg-red-100 text-red-700'
                          : devicePrediction.risk_level === 'high'
                          ? 'bg-orange-100 text-orange-700'
                          : devicePrediction.risk_level === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
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

                <div>
                  <p className="text-sm text-slate-600 mb-2">Tiempo Estimado de Falla</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {devicePrediction.estimated_time_to_fail > 0
                      ? `${devicePrediction.estimated_time_to_fail}h`
                      : 'Inmediata'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-600 mb-2">Recomendación</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {devicePrediction.maintenance_recommended
                      ? 'Mantenimiento requerido'
                      : 'Funcionamiento normal'}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
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
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Alertas de este Dispositivo
              </h3>
              <div className="space-y-3">
                {deviceAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="border border-slate-200 rounded-lg p-4 flex items-start justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 mb-1">{alert.type}</p>
                      <p className="text-sm text-slate-600 mb-2">{alert.message}</p>
                      <p className="text-xs text-slate-500">
                        {format(new Date(alert.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        alert.priority === 'critical'
                          ? 'bg-red-100 text-red-700'
                          : alert.priority === 'high'
                          ? 'bg-orange-100 text-orange-700'
                          : alert.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
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
