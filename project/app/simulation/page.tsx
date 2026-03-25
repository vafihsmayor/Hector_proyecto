'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import KPICard from '@/components/KPICard';
import ChartCard from '@/components/ChartCard';
import { Play, RefreshCw, TriangleAlert as AlertTriangle, Battery, Activity, Radio } from 'lucide-react';
import { useBeacons } from '@/lib/useBeacons';

interface SimulationResult {
  scenario: string;
  battery_level: number;
  failure_probability: number;
  estimated_time_to_fail: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  maintenance_recommended: boolean;
  recommendations: string[];
}

export default function SimulationPage() {
  const { beacons, error } = useBeacons();
  const [selectedBeacon, setSelectedBeacon] = useState('');
  const [selectedScenario, setSelectedScenario] = useState('battery_50');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  useEffect(() => {
    if (!selectedBeacon && beacons.length > 0) {
      setSelectedBeacon(beacons[0].id);
    }
  }, [beacons, selectedBeacon]);

  const scenarios = [
    { id: 'battery_50', name: 'Batería al 50%', description: 'Simula el dispositivo con batería media' },
    { id: 'battery_low', name: 'Batería Baja (20%)', description: 'Simula batería en nivel bajo' },
    { id: 'battery_critical', name: 'Batería Crítica (5%)', description: 'Simula batería casi agotada' },
    { id: 'recurring_failures', name: 'Fallas Recurrentes', description: 'Simula múltiples fallas en el período' },
    { id: 'disconnected', name: 'Dispositivo Desconectado', description: 'Simula pérdida de conectividad' },
    { id: 'high_temperature', name: 'Temperatura Elevada', description: 'Simula condiciones de alta temperatura' },
  ];

  const runSimulation = () => {
    setIsRunning(true);

    setTimeout(() => {
      const scenarioResults: Record<string, SimulationResult> = {
        battery_50: {
          scenario: 'Batería al 50%',
          battery_level: 50,
          failure_probability: 35,
          estimated_time_to_fail: 720,
          risk_level: 'medium',
          maintenance_recommended: true,
          recommendations: [
            'Programar mantenimiento preventivo en las próximas 2 semanas',
            'Monitorear la tasa de descarga de batería',
            'Verificar condiciones ambientales del dispositivo',
            'Considerar reemplazo de batería en el próximo ciclo de mantenimiento',
          ],
        },
        battery_low: {
          scenario: 'Batería Baja (20%)',
          battery_level: 20,
          failure_probability: 65,
          estimated_time_to_fail: 168,
          risk_level: 'high',
          maintenance_recommended: true,
          recommendations: [
            'URGENTE: Reemplazo de batería requerido en 7 días',
            'Incrementar frecuencia de monitoreo a cada 6 horas',
            'Preparar equipo de reemplazo inmediatamente',
            'Notificar al equipo de mantenimiento',
            'Considerar activar modo de ahorro de energía',
          ],
        },
        battery_critical: {
          scenario: 'Batería Crítica (5%)',
          battery_level: 5,
          failure_probability: 95,
          estimated_time_to_fail: 24,
          risk_level: 'critical',
          maintenance_recommended: true,
          recommendations: [
            'CRÍTICO: Reemplazo inmediato de batería requerido',
            'Alto riesgo de falla en las próximas 24 horas',
            'Activar protocolo de emergencia',
            'Desplegar equipo de reemplazo de inmediato',
            'Considerar dispositivo de respaldo si está disponible',
          ],
        },
        recurring_failures: {
          scenario: 'Fallas Recurrentes',
          battery_level: 70,
          failure_probability: 75,
          estimated_time_to_fail: 120,
          risk_level: 'high',
          maintenance_recommended: true,
          recommendations: [
            'Inspección completa del hardware requerida',
            'Revisar historial de fallas para identificar patrón',
            'Verificar integridad de componentes internos',
            'Considerar reemplazo completo del dispositivo',
            'Actualizar firmware a última versión disponible',
          ],
        },
        disconnected: {
          scenario: 'Dispositivo Desconectado',
          battery_level: 0,
          failure_probability: 100,
          estimated_time_to_fail: 0,
          risk_level: 'critical',
          maintenance_recommended: true,
          recommendations: [
            'CRÍTICO: Pérdida total de conectividad',
            'Verificar alimentación eléctrica del dispositivo',
            'Inspeccionar conexiones físicas',
            'Verificar cobertura de red en la ubicación',
            'Reemplazo inmediato si no responde',
          ],
        },
        high_temperature: {
          scenario: 'Temperatura Elevada',
          battery_level: 65,
          failure_probability: 55,
          estimated_time_to_fail: 336,
          risk_level: 'high',
          maintenance_recommended: true,
          recommendations: [
            'Verificar ventilación en la ubicación del dispositivo',
            'Revisar temperatura ambiente del área',
            'Inspeccionar sistema de refrigeración si aplica',
            'Considerar reubicación a zona con mejor ventilación',
            'Monitorear temperatura cada 12 horas',
          ],
        },
      };

      setResult(scenarioResults[selectedScenario]);
      setIsRunning(false);
    }, 2000);
  };

  const resetSimulation = () => {
    setResult(null);
  };

  const beacon = beacons.find((b) => b.id === selectedBeacon);

  const simulationChartData = result
    ? Array.from({ length: 30 }, (_, i) => ({
        day: `Día ${i + 1}`,
        battery: Math.max(0, result.battery_level - i * (result.battery_level / 30)),
        probability: Math.min(100, result.failure_probability + i * ((100 - result.failure_probability) / 30)),
      }))
    : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="pt-16 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Simulación de Escenarios</h1>
            <p className="text-slate-600">
              Prueba diferentes escenarios operativos y analiza predicciones de mantenimiento
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Configuración de Simulación
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Seleccionar Dispositivo
                </label>
                <select
                  value={selectedBeacon}
                  onChange={(e) => setSelectedBeacon(e.target.value)}
                  disabled={isRunning}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                >
                  {beacons.map((beacon) => (
                    <option key={beacon.id} value={beacon.id}>
                      {beacon.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Escenario a Simular
                </label>
                <select
                  value={selectedScenario}
                  onChange={(e) => setSelectedScenario(e.target.value)}
                  disabled={isRunning}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                >
                  {scenarios.map((scenario) => (
                    <option key={scenario.id} value={scenario.id}>
                      {scenario.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Acciones</label>
                <div className="flex gap-2">
                  <button
                    onClick={runSimulation}
                    disabled={isRunning}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRunning ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Ejecutando...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Ejecutar
                      </>
                    )}
                  </button>
                  <button
                    onClick={resetSimulation}
                    disabled={!result || isRunning}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4">
                {error}
              </div>
            )}

            {beacon && (
              <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">
                  <span className="font-semibold">Dispositivo seleccionado:</span> {beacon.name} (
                  {beacon.device_id}) - {beacon.location}
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  <span className="font-semibold">Escenario:</span>{' '}
                  {scenarios.find((s) => s.id === selectedScenario)?.description}
                </p>
              </div>
            )}
          </div>

          {result && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <KPICard
                  title="Nivel de Batería Simulado"
                  value={`${result.battery_level}%`}
                  icon={Battery}
                  status={
                    result.battery_level > 50
                      ? 'success'
                      : result.battery_level > 20
                      ? 'warning'
                      : 'danger'
                  }
                />

                <KPICard
                  title="Probabilidad de Falla"
                  value={`${result.failure_probability}%`}
                  icon={AlertTriangle}
                  status={
                    result.risk_level === 'critical'
                      ? 'danger'
                      : result.risk_level === 'high'
                      ? 'warning'
                      : 'info'
                  }
                />

                <KPICard
                  title="Tiempo Estimado de Falla"
                  value={result.estimated_time_to_fail > 0 ? `${result.estimated_time_to_fail}h` : 'Inmediata'}
                  icon={Activity}
                  status={result.estimated_time_to_fail < 100 ? 'danger' : 'warning'}
                />

                <KPICard
                  title="Nivel de Riesgo"
                  value={
                    result.risk_level === 'critical'
                      ? 'Crítico'
                      : result.risk_level === 'high'
                      ? 'Alto'
                      : result.risk_level === 'medium'
                      ? 'Medio'
                      : 'Bajo'
                  }
                  icon={Radio}
                  status={result.risk_level === 'critical' ? 'danger' : result.risk_level === 'high' ? 'warning' : 'info'}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <ChartCard
                  title="Proyección de Batería (30 días)"
                  data={simulationChartData}
                  type="line"
                  dataKey="battery"
                  xAxisKey="day"
                  color="#10b981"
                  height={300}
                />

                <ChartCard
                  title="Proyección de Probabilidad de Falla"
                  data={simulationChartData}
                  type="area"
                  dataKey="probability"
                  xAxisKey="day"
                  color="#ef4444"
                  height={300}
                />
              </div>

              <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Recomendaciones de Mantenimiento
                </h3>

                <div
                  className={`mb-4 p-4 rounded-lg ${
                    result.maintenance_recommended
                      ? 'bg-yellow-50 border border-yellow-200'
                      : 'bg-green-50 border border-green-200'
                  }`}
                >
                  <p className="font-semibold text-slate-900">
                    {result.maintenance_recommended
                      ? 'Mantenimiento Requerido'
                      : 'Funcionamiento Normal'}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    Basado en el escenario simulado: {result.scenario}
                  </p>
                </div>

                <ul className="space-y-3">
                  {result.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </span>
                      <p className="text-slate-700">{recommendation}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {!result && (
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-12 text-center">
              <Radio className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">
                Selecciona un dispositivo y un escenario, luego haz clic en &quot;Ejecutar&quot; para iniciar
                la simulación
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
