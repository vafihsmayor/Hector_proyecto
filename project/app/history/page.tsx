'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ChartCard from '@/components/ChartCard';
import { Download, Calendar } from 'lucide-react';
import { getBeaconMetrics } from '@/lib/api';
import { useBeacons } from '@/lib/useBeacons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function HistoryPage() {
  const { beacons, error: beaconError } = useBeacons();
  const [selectedBeacon, setSelectedBeacon] = useState('');
  const [selectedMetric, setSelectedMetric] = useState('battery_level');
  const [dateRange, setDateRange] = useState('30');
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');
  
  const [metrics, setMetrics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedBeacon && beacons.length > 0) {
      setSelectedBeacon(beacons[0].id);
    }
  }, [beacons, selectedBeacon]);

  useEffect(() => {
    if (selectedBeacon) {
      const fetchMetrics = async () => {
        setIsLoading(true);
        try {
          const data = await getBeaconMetrics(selectedBeacon, parseInt(dateRange));
          setMetrics(data.reverse()); // Orden cronológico para la gráfica
          setError(null);
        } catch (err: any) {
          setError(err.message || 'Error al cargar el histórico');
        } finally {
          setIsLoading(false);
        }
      };
      fetchMetrics();
    }
  }, [selectedBeacon, dateRange]);

  const beacon = beacons.find((b) => b.id === selectedBeacon);

  const chartData = metrics.map((m) => ({
    date: format(new Date(m.timestamp), 'dd MMM', { locale: es }),
    value: m[selectedMetric],
  }));

  const metricLabels: Record<string, string> = {
    battery_level: 'Nivel de Batería (%)',
    signal_strength: 'Intensidad de Señal (dBm)',
    estimated_distance: 'Distancia Estimada (m)',
    usage_time: 'Tiempo de Uso (horas)',
    temperature: 'Temperatura (°C)',
  };

  const metricColors: Record<string, string> = {
    battery_level: '#10b981',
    signal_strength: '#3b82f6',
    estimated_distance: '#f59e0b',
    usage_time: '#8b5cf6',
    temperature: '#ef4444',
  };

  const handleExport = () => {
    alert('Exportación de datos en desarrollo');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="pt-16 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Histórico de Métricas</h1>
            <p className="text-slate-600">Análisis temporal de datos de dispositivos beacon</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Filtros de Consulta</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Dispositivo
                </label>
                <select
                  value={selectedBeacon}
                  onChange={(e) => setSelectedBeacon(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {beacons.map((beacon) => (
                    <option key={beacon.id} value={beacon.id}>
                      {beacon.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Métrica</label>
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="battery_level">Batería</option>
                  <option value="signal_strength">Señal RSSI</option>
                  <option value="estimated_distance">Distancia</option>
                  <option value="usage_time">Tiempo de Uso</option>
                  <option value="temperature">Temperatura</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Período (días)
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="7">7 días</option>
                  <option value="15">15 días</option>
                  <option value="30">30 días</option>
                  <option value="60">60 días</option>
                  <option value="90">90 días</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tipo de Gráfica
                </label>
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value as 'line' | 'area' | 'bar')}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="line">Línea</option>
                  <option value="area">Área</option>
                  <option value="bar">Barras</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Acciones</label>
                <button
                  onClick={handleExport}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Exportar
                </button>
              </div>
            </div>
          </div>

          {(error || beaconError) && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
              {error || beaconError}
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-lg shadow-sm">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-600">Cargando datos históricos...</p>
            </div>
          ) : (
            <>
              <ChartCard
                title={metricLabels[selectedMetric]}
                data={chartData}
                type={chartType}
                dataKey="value"
                xAxisKey="date"
                color={metricColors[selectedMetric]}
                height={400}
              />

              <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 mt-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Estadísticas del Período
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Valor Promedio</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {chartData.length > 0
                        ? (chartData.reduce((acc, d) => acc + d.value, 0) / chartData.length).toFixed(2)
                        : '0.00'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Valor Máximo</p>
                    <p className="text-2xl font-bold text-green-600">
                      {chartData.length > 0
                        ? Math.max(...chartData.map((d) => d.value)).toFixed(2)
                        : '0.00'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Valor Mínimo</p>
                    <p className="text-2xl font-bold text-red-600">
                      {chartData.length > 0
                        ? Math.min(...chartData.map((d) => d.value)).toFixed(2)
                        : '0.00'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Desviación</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {(() => {
                        if (chartData.length === 0) return '0.00';
                        const avg = chartData.reduce((acc, d) => acc + d.value, 0) / chartData.length;
                        const variance =
                          chartData.reduce((acc, d) => acc + Math.pow(d.value - avg, 2), 0) /
                          chartData.length;
                        return Math.sqrt(variance).toFixed(2);
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
