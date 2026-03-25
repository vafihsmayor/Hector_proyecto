'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import KPICard from '@/components/KPICard';
import ChartCard from '@/components/ChartCard';
import AlertCard from '@/components/AlertCard';
import { Battery, Radio, Activity, TriangleAlert as AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { getBeacons, getDashboardSummary, getAlerts, type DashboardSummary } from '@/lib/api';
import type { Beacon } from '@/lib/types';
import {
  mockAlerts,
  mockPredictions,
  generateBatteryChartData,
  generateSignalChartData,
  generateUsageChartData,
} from '@/lib/mockData';

export default function DashboardPage() {
  const [beacons, setBeacons] = useState<Beacon[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [apiError, setApiError] = useState('');
  const [batteryData, setBatteryData] = useState<any[]>([]);
  const [signalData, setSignalData] = useState<any[]>([]);
  const [usageData, setUsageData] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setApiError('');
      try {
        const [summaryResponse, beaconsResponse, alertsResponse] = await Promise.all([
          getDashboardSummary(),
          getBeacons(),
          getAlerts('all', 'active'),
        ]);
        setSummary(summaryResponse);
        setBeacons(beaconsResponse);
        setAlerts(alertsResponse);
      } catch (err: any) {
        setApiError(err?.message || 'No se pudo cargar el resumen del dashboard');
      }

      setBatteryData(generateBatteryChartData(30));
      setSignalData(generateSignalChartData(30));
      setUsageData(generateUsageChartData(30));
    };

    loadData();
  }, []);

  const activeBeacons = summary?.active_beacons ?? beacons.filter((b) => b.status === 'active').length;
  const inactiveBeacons = summary?.inactive_beacons ?? beacons.filter((b) => b.status === 'inactive').length;
  const disconnectedBeacons =
    summary?.disconnected_beacons ?? beacons.filter((b) => b.status === 'disconnected').length;
  const totalBeacons = summary?.total_beacons ?? beacons.length;

  const activeAlerts = summary?.active_alerts ?? 0;
  const criticalAlerts = alerts.filter((a) => a.priority === 'critical').length;

  const avgBattery = summary?.avg_battery ?? 0;

  const highRiskDevices = mockPredictions.filter(
    (p) => p.risk_level === 'high' || p.risk_level === 'critical'
  ).length;

  return (
    <div className="min-h-screen bg-[#020617]">
      <Navbar />
      <div>
        <main className="pt-20 p-6 max-w-[1600px] mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Dashboard General</h1>
            <p className="text-slate-400 font-medium">
              Monitoreo en tiempo real de dispositivos beacon BLE
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <KPICard
              title="Dispositivos Activos"
              value={activeBeacons}
              icon={Radio}
              status="success"
              subtitle={`${totalBeacons} dispositivos totales`}
            />

            <KPICard
              title="Alertas Activas"
              value={activeAlerts}
              icon={AlertTriangle}
              status={criticalAlerts > 0 ? 'danger' : 'warning'}
              subtitle={`${criticalAlerts} críticas`}
            />

            <KPICard
              title="Batería Promedio"
              value={`${avgBattery.toFixed(1)}%`}
              icon={Battery}
              status={avgBattery > 50 ? 'success' : avgBattery > 20 ? 'warning' : 'danger'}
              trend={avgBattery > 50 ? 'stable' : 'down'}
              change={5}
            />

            <KPICard
              title="Dispositivos en Riesgo"
              value={highRiskDevices}
              icon={TrendingUp}
              status={highRiskDevices > 2 ? 'danger' : 'warning'}
              subtitle="Alto riesgo de falla"
            />
          </div>

          {apiError && (
            <div className="mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-4 font-bold text-sm">
              {apiError}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <ChartCard
                title="Evolución de Batería (30 días)"
                data={batteryData}
                type="line"
                dataKey="battery"
                xAxisKey="date"
                color="#10b981"
                height={350}
              />
            </div>

            <div>
              <div className="bg-slate-900 border border-white/10 rounded-xl p-6 shadow-2xl h-full">
                <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">
                  Estado de Dispositivos
                </h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400">Activos</span>
                      <span className="text-sm font-black text-emerald-400">{activeBeacons}</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2 shadow-inner">
                      <div
                        className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-2 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                        style={{ width: `${totalBeacons ? (activeBeacons / totalBeacons) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400">Inactivos</span>
                      <span className="text-sm font-black text-slate-300">{inactiveBeacons}</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2 shadow-inner">
                      <div
                        className="bg-slate-600 h-2 rounded-full"
                        style={{ width: `${totalBeacons ? (inactiveBeacons / totalBeacons) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400">Desconectados</span>
                      <span className="text-sm font-black text-rose-400">
                        {disconnectedBeacons}
                      </span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2 shadow-inner">
                      <div
                        className="bg-gradient-to-r from-rose-600 to-rose-400 h-2 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.3)]"
                        style={{
                          width: `${totalBeacons ? (disconnectedBeacons / totalBeacons) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/10">
                  <div className="text-center">
                    <p className="text-4xl font-black text-white">{totalBeacons}</p>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2">Total Dispositivos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ChartCard
              title="Intensidad de Señal (RSSI)"
              data={signalData}
              type="area"
              dataKey="signal"
              xAxisKey="date"
              color="#3b82f6"
              height={300}
            />

            <ChartCard
              title="Tiempo de Uso Acumulado (horas)"
              data={usageData}
              type="bar"
              dataKey="usage"
              xAxisKey="date"
              color="#8b5cf6"
              height={300}
            />
          </div>

          <div className="bg-slate-900 border border-white/10 rounded-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">Alertas Recientes</h3>
              <a
                href="/alerts"
                className="text-xs font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors"
              >
                Ver todas
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alerts.slice(0, 4).map((alert) => {
                const beacon = beacons.find((b) => b.id === alert.beacon);
                return (
                  <AlertCard
                    key={alert.id}
                    type={alert.type}
                    priority={alert.priority}
                    message={alert.message}
                    deviceName={beacon?.name || 'Dispositivo desconocido'}
                    timestamp={alert.created_at}
                    status={alert.status}
                  />
                );
              })}
              {alerts.length === 0 && (
                <div className="col-span-full py-12 text-center bg-white/5 border border-dashed border-white/10 rounded-xl">
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No hay alertas activas en este momento</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
