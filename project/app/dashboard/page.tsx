'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import KPICard from '@/components/KPICard';
import ChartCard from '@/components/ChartCard';
import AlertCard from '@/components/AlertCard';
import { Battery, Radio, Activity, TriangleAlert as AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { getBeacons, getDashboardSummary, type DashboardSummary } from '@/lib/api';
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
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [apiError, setApiError] = useState('');
  const [batteryData, setBatteryData] = useState<any[]>([]);
  const [signalData, setSignalData] = useState<any[]>([]);
  const [usageData, setUsageData] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setApiError('');
      try {
        const [summaryResponse, beaconsResponse] = await Promise.all([
          getDashboardSummary(),
          getBeacons(),
        ]);
        setSummary(summaryResponse);
        setBeacons(beaconsResponse);
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

  const activeAlerts = mockAlerts.filter((a) => a.status === 'active').length;
  const criticalAlerts = mockAlerts.filter(
    (a) => a.status === 'active' && a.priority === 'critical'
  ).length;

  const avgBattery = summary?.avg_battery ?? 0;

  const highRiskDevices = mockPredictions.filter(
    (p) => p.risk_level === 'high' || p.risk_level === 'critical'
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="pt-16 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Dashboard General</h1>
            <p className="text-slate-600">
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
            <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
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
              <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm h-full">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Estado de Dispositivos
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Activos</span>
                      <span className="text-sm font-bold text-green-600">{activeBeacons}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${totalBeacons ? (activeBeacons / totalBeacons) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Inactivos</span>
                      <span className="text-sm font-bold text-slate-600">{inactiveBeacons}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-slate-400 h-2 rounded-full"
                        style={{ width: `${totalBeacons ? (inactiveBeacons / totalBeacons) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Desconectados</span>
                      <span className="text-sm font-bold text-red-600">
                        {disconnectedBeacons}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{
                          width: `${totalBeacons ? (disconnectedBeacons / totalBeacons) * 100 : 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-slate-900">{totalBeacons}</p>
                    <p className="text-sm text-slate-600 mt-1">Total de Dispositivos</p>
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

          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Alertas Recientes</h3>
              <a
                href="/alerts"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Ver todas
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockAlerts.slice(0, 4).map((alert) => {
                const beacon = beacons.find((b) => b.id === alert.beacon_id);
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
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
