'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { FileText, Download, Calendar } from 'lucide-react';
import { useBeacons } from '@/lib/useBeacons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ReportsPage() {
  const { beacons, error } = useBeacons();
  const [reportType, setReportType] = useState('comprehensive');
  const [selectedBeacon, setSelectedBeacon] = useState('all');
  const [startDate, setStartDate] = useState(
    format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    { id: 'comprehensive', name: 'Reporte Integral', description: 'Incluye todos los datos y métricas' },
    { id: 'battery', name: 'Análisis de Batería', description: 'Enfocado en estado de baterías' },
    { id: 'alerts', name: 'Reporte de Alertas', description: 'Historial de alertas generadas' },
    { id: 'predictions', name: 'Predicciones de Mantenimiento', description: 'Análisis predictivo' },
    { id: 'failures', name: 'Registro de Fallas', description: 'Historial de fallas registradas' },
  ];

  const handleGenerateReport = (fileType: 'excel' | 'pdf') => {
    setIsGenerating(true);

    setTimeout(() => {
      const reportName = reportTypes.find((r) => r.id === reportType)?.name || 'Reporte';
      const beaconName = selectedBeacon === 'all' ? 'Todos' : beacons.find((b) => b.id === selectedBeacon)?.name;
      const fileName = `${reportName}_${beaconName}_${format(new Date(), 'yyyyMMdd')}.${fileType}`;

      alert(
        `Generando reporte: ${fileName}\n\nFuncionalidad en desarrollo.\n\nEste reporte incluiría:\n- Período: ${format(new Date(startDate), 'dd/MM/yyyy', { locale: es })} - ${format(new Date(endDate), 'dd/MM/yyyy', { locale: es })}\n- Tipo: ${reportName}\n- Dispositivos: ${beaconName}`
      );

      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#020617]">
      <Navbar />
      <div>
        <main className="pt-20 p-6 max-w-[1600px] mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Generación de Reportes</h1>
            <p className="text-slate-400 font-medium">
              Exporta informes detallados en formato Excel o PDF
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-6 mb-8">
                <h3 className="text-lg font-bold text-white mb-8 uppercase tracking-wider">
                  Configuración del Reporte
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                      Tipo de Reporte
                    </label>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      disabled={isGenerating}
                      className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-30 cursor-pointer"
                    >
                      {reportTypes.map((type) => (
                        <option key={type.id} value={type.id} className="bg-slate-900">
                          {type.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-2 font-medium">
                      {reportTypes.find((r) => r.id === reportType)?.description}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                      Dispositivo
                    </label>
                    <select
                      value={selectedBeacon}
                      onChange={(e) => setSelectedBeacon(e.target.value)}
                      disabled={isGenerating}
                      className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-30 cursor-pointer"
                    >
                      <option value="all" className="bg-slate-900">Todos los dispositivos</option>
                      {beacons.map((beacon) => (
                        <option key={beacon.id} value={beacon.id} className="bg-slate-900">
                          {beacon.name} ({beacon.device_id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                        Fecha Inicio
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        disabled={isGenerating}
                        className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                        Fecha Fin
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        disabled={isGenerating}
                        className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-30"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Formato de Exportación</p>
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleGenerateReport('excel')}
                        disabled={isGenerating}
                        className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGenerating ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Download className="w-5 h-5" />
                        )}
                        Descargar Excel
                      </button>

                      <button
                        onClick={() => handleGenerateReport('pdf')}
                        disabled={isGenerating}
                        className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-rose-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGenerating ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Download className="w-5 h-5" />
                        )}
                        Descargar PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-4 font-bold text-sm">
                  {error}
                </div>
              )}

              <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Contenido del Reporte
                </h3>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Resumen Ejecutivo</p>
                      <p className="text-sm text-slate-600">
                        KPIs principales y estado general del sistema
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Datos de Dispositivos</p>
                      <p className="text-sm text-slate-600">
                        Información detallada de beacons seleccionados
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Métricas Históricas</p>
                      <p className="text-sm text-slate-600">
                        Evolución temporal de batería, señal y uso
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      4
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Alertas Generadas</p>
                      <p className="text-sm text-slate-600">
                        Registro completo de alertas en el período
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      5
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Predicciones de Fallas</p>
                      <p className="text-sm text-slate-600">
                        Análisis predictivo y recomendaciones de mantenimiento
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      6
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Gráficas y Visualizaciones</p>
                      <p className="text-sm text-slate-600">
                        Representación visual de datos y tendencias
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
            <div className="space-y-6">
              <div className="bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">Resumen</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Período</p>
                    <p className="text-sm font-bold text-white">
                      {format(new Date(startDate), 'dd/MM/yyyy', { locale: es })} -{' '}
                      {format(new Date(endDate), 'dd/MM/yyyy', { locale: es })}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Tipo de Reporte</p>
                    <p className="text-sm font-bold text-blue-400">
                      {reportTypes.find((r) => r.id === reportType)?.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Dispositivos</p>
                    <p className="text-sm font-bold text-white">
                      {selectedBeacon === 'all'
                        ? `Todos (${beacons.length})`
                        : beacons.find((b) => b.id === selectedBeacon)?.name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 shadow-xl shadow-blue-900/40 relative overflow-hidden group">
                <FileText className="w-12 h-12 text-white/20 absolute -right-2 -bottom-2 group-hover:scale-125 transition-transform" />
                <h4 className="font-black uppercase tracking-widest text-xs text-blue-100 mb-4">Formatos</h4>
                <ul className="space-y-3 text-sm text-white font-bold">
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-blue-300 rounded-full shadow-[0_0_8px_rgba(147,197,253,0.8)]"></div>
                    Excel (.xlsx)
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-blue-300 rounded-full shadow-[0_0_8px_rgba(147,197,253,0.8)]"></div>
                    PDF Ejecutivo
                  </li>
                </ul>
              </div>
            </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
