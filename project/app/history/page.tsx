'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
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
    <div className="min-h-screen bg-[#020617]">
      <Navbar />
      <div>
        <main className="pt-20 p-6 max-w-[1600px] mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Histórico de Métricas</h1>
            <p className="text-slate-400 font-medium">Análisis temporal de datos de dispositivos beacon</p>
          </div>

          <div className="bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-6 mb-8">
            <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">Filtros de Consulta</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                  Dispositivo
                </label>
                <select
                  value={selectedBeacon}
                  onChange={(e) => setSelectedBeacon(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                >
                  {beacons.map((beacon) => (
                    <option key={beacon.id} value={beacon.id} className="bg-slate-900">
                      {beacon.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Métrica</label>
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                >
                  <option value="battery_level" className="bg-slate-900">Batería</option>
                  <option value="signal_strength" className="bg-slate-900">Señal RSSI</option>
                  <option value="estimated_distance" className="bg-slate-900">Distancia</option>
                  <option value="usage_time" className="bg-slate-900">Tiempo de Uso</option>
                  <option value="temperature" className="bg-slate-900">Temperatura</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                  Período (días)
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                >
                  <option value="7" className="bg-slate-900">7 días</option>
                  <option value="15" className="bg-slate-900">15 días</option>
                  <option value="30" className="bg-slate-900">30 días</option>
                  <option value="60" className="bg-slate-900">60 días</option>
                  <option value="90" className="bg-slate-900">90 días</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                  Tipo de Gráfica
                </label>
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value as 'line' | 'area' | 'bar')}
                  className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                >
                  <option value="line" className="bg-slate-900">Línea</option>
                  <option value="area" className="bg-slate-900">Área</option>
                  <option value="bar" className="bg-slate-900">Barras</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Acciones</label>
                <button
                  onClick={handleExport}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95"
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
            <div className="flex flex-col items-center justify-center py-24 bg-slate-900 border border-white/10 rounded-xl shadow-2xl">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6 shadow-[0_0_15px_rgba(59,130,246,0.3)]"></div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Cargando datos históricos...</p>
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

              <div className="bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-6 mt-8">
                <h3 className="text-lg font-bold text-white mb-8 uppercase tracking-wider">
                  Estadísticas del Período
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Valor Promedio</p>
                    <p className="text-3xl font-black text-white">
                      {chartData.length > 0
                        ? (chartData.reduce((acc, d) => acc + d.value, 0) / chartData.length).toFixed(2)
                        : '0.00'}
                    </p>
                  </div>
                  <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60 mb-2">Valor Máximo</p>
                    <p className="text-3xl font-black text-emerald-400">
                      {chartData.length > 0
                        ? Math.max(...chartData.map((d) => d.value)).toFixed(2)
                        : '0.00'}
                    </p>
                  </div>
                  <div className="p-4 bg-rose-500/5 rounded-xl border border-rose-500/10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-500/60 mb-2">Valor Mínimo</p>
                    <p className="text-3xl font-black text-rose-400">
                      {chartData.length > 0
                        ? Math.min(...chartData.map((d) => d.value)).toFixed(2)
                        : '0.00'}
                    </p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Desviación</p>
                    <p className="text-3xl font-black text-slate-200">
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
