'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { FileText, Download, Calendar } from 'lucide-react';
import { mockBeacons } from '@/lib/mockData';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ReportsPage() {
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
      const beaconName = selectedBeacon === 'all' ? 'Todos' : mockBeacons.find((b) => b.id === selectedBeacon)?.name;
      const fileName = `${reportName}_${beaconName}_${format(new Date(), 'yyyyMMdd')}.${fileType}`;

      alert(
        `Generando reporte: ${fileName}\n\nFuncionalidad en desarrollo.\n\nEste reporte incluiría:\n- Período: ${format(new Date(startDate), 'dd/MM/yyyy', { locale: es })} - ${format(new Date(endDate), 'dd/MM/yyyy', { locale: es })}\n- Tipo: ${reportName}\n- Dispositivos: ${beaconName}`
      );

      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="pt-16 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Generación de Reportes</h1>
            <p className="text-slate-600">
              Exporta informes detallados en formato Excel o PDF
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Configuración del Reporte
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tipo de Reporte
                    </label>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      disabled={isGenerating}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    >
                      {reportTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-sm text-slate-500 mt-1">
                      {reportTypes.find((r) => r.id === reportType)?.description}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Dispositivo
                    </label>
                    <select
                      value={selectedBeacon}
                      onChange={(e) => setSelectedBeacon(e.target.value)}
                      disabled={isGenerating}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    >
                      <option value="all">Todos los dispositivos</option>
                      {mockBeacons.map((beacon) => (
                        <option key={beacon.id} value={beacon.id}>
                          {beacon.name} ({beacon.device_id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Fecha Inicio
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        disabled={isGenerating}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Fecha Fin
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        disabled={isGenerating}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-sm font-medium text-slate-700 mb-3">Formato de Exportación</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleGenerateReport('excel')}
                        disabled={isGenerating}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Resumen</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-600">Período</p>
                    <p className="text-base font-semibold text-slate-900">
                      {format(new Date(startDate), 'dd/MM/yyyy', { locale: es })} -{' '}
                      {format(new Date(endDate), 'dd/MM/yyyy', { locale: es })}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-600">Tipo</p>
                    <p className="text-base font-semibold text-slate-900">
                      {reportTypes.find((r) => r.id === reportType)?.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-600">Dispositivos</p>
                    <p className="text-base font-semibold text-slate-900">
                      {selectedBeacon === 'all'
                        ? `Todos (${mockBeacons.length})`
                        : mockBeacons.find((b) => b.id === selectedBeacon)?.name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <FileText className="w-10 h-10 text-blue-600 mb-3" />
                <h4 className="font-semibold text-blue-900 mb-2">Formatos Disponibles</h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    Excel (.xlsx) - Datos estructurados
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    PDF - Formato ejecutivo
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
