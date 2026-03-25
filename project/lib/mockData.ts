import { Beacon, Metric, Alert, Prediction, Failure } from './types';

export const mockBeacons: Beacon[] = [
  {
    id: '1',
    device_id: 'BC04P-001',
    name: 'Beacon Almacén Principal',
    model: 'Blue Charm BC04P',
    status: 'active',
    enrolled_at: '2024-01-15T10:00:00Z',
    last_seen: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    location: 'Almacén - Zona A',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    device_id: 'BC04P-002',
    name: 'Beacon Entrada Norte',
    model: 'Blue Charm BC04P',
    status: 'active',
    enrolled_at: '2024-01-20T14:30:00Z',
    last_seen: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    location: 'Entrada Norte',
    created_at: '2024-01-20T14:30:00Z',
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    device_id: 'BC04P-003',
    name: 'Beacon Área de Producción',
    model: 'Blue Charm BC04P',
    status: 'active',
    enrolled_at: '2024-02-01T09:15:00Z',
    last_seen: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    location: 'Planta - Sección 1',
    created_at: '2024-02-01T09:15:00Z',
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    device_id: 'BC04P-004',
    name: 'Beacon Oficinas',
    model: 'Blue Charm BC04P',
    status: 'inactive',
    enrolled_at: '2024-02-10T11:00:00Z',
    last_seen: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    location: 'Edificio Administrativo',
    created_at: '2024-02-10T11:00:00Z',
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    device_id: 'BC04P-005',
    name: 'Beacon Estacionamiento',
    model: 'Blue Charm BC04P',
    status: 'disconnected',
    enrolled_at: '2024-02-15T16:45:00Z',
    last_seen: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    location: 'Estacionamiento Nivel 2',
    created_at: '2024-02-15T16:45:00Z',
    updated_at: new Date().toISOString(),
  },
];

export function generateMockMetrics(beaconId: string, days: number = 30): Metric[] {
  const metrics: Metric[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);

    const baseBattery = 100 - (days - i) * (100 / (4 * 30));
    const battery = Math.max(10, Math.min(100, baseBattery + Math.random() * 5 - 2.5));

    metrics.push({
      id: `metric-${beaconId}-${i}`,
      beacon_id: beaconId,
      battery_level: Math.round(battery * 10) / 10,
      signal_strength: -65 + Math.random() * 20 - 10,
      estimated_distance: 2 + Math.random() * 8,
      usage_time: (days - i) * 24 + Math.random() * 24,
      temperature: 20 + Math.random() * 15,
      timestamp: timestamp.toISOString(),
      created_at: timestamp.toISOString(),
    });
  }

  return metrics;
}

export const mockAlerts: Alert[] = [
  {
    id: '1',
    beacon_id: '5',
    type: 'Dispositivo Desconectado',
    priority: 'critical',
    message: 'El beacon BC04P-005 no ha enviado señal en las últimas 48 horas',
    status: 'active',
    acknowledged_by: null,
    acknowledged_at: null,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    beacon_id: '1',
    type: 'Batería Baja',
    priority: 'high',
    message: 'El nivel de batería del beacon BC04P-001 está por debajo del 20%',
    status: 'active',
    acknowledged_by: null,
    acknowledged_at: null,
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    beacon_id: '2',
    type: 'Mantenimiento Preventivo',
    priority: 'medium',
    message: 'Se recomienda realizar mantenimiento preventivo al beacon BC04P-002',
    status: 'acknowledged',
    acknowledged_by: '1',
    acknowledged_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    beacon_id: '3',
    type: 'Señal Débil',
    priority: 'low',
    message: 'La intensidad de señal del beacon BC04P-003 ha disminuido',
    status: 'resolved',
    acknowledged_by: '1',
    acknowledged_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockPredictions: Prediction[] = [
  {
    id: '1',
    beacon_id: '1',
    failure_probability: 75,
    estimated_time_to_fail: 48,
    risk_level: 'high',
    maintenance_recommended: true,
    confidence_score: 0.85,
    model_version: 'v1.0-simulated',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    beacon_id: '2',
    failure_probability: 45,
    estimated_time_to_fail: 168,
    risk_level: 'medium',
    maintenance_recommended: true,
    confidence_score: 0.78,
    model_version: 'v1.0-simulated',
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    beacon_id: '3',
    failure_probability: 15,
    estimated_time_to_fail: 720,
    risk_level: 'low',
    maintenance_recommended: false,
    confidence_score: 0.92,
    model_version: 'v1.0-simulated',
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    beacon_id: '5',
    failure_probability: 95,
    estimated_time_to_fail: 0,
    risk_level: 'critical',
    maintenance_recommended: true,
    confidence_score: 0.98,
    model_version: 'v1.0-simulated',
    created_at: new Date().toISOString(),
  },
];

export const mockFailures: Failure[] = [
  {
    id: '1',
    beacon_id: '5',
    failure_type: 'connectivity',
    severity: 'critical',
    description: 'Pérdida total de conectividad con el dispositivo',
    occurred_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    resolved_at: null,
    resolved_by: null,
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    beacon_id: '1',
    failure_type: 'battery',
    severity: 'high',
    description: 'Batería degradada, necesita reemplazo',
    occurred_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    resolved_at: null,
    resolved_by: null,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    beacon_id: '2',
    failure_type: 'sensor',
    severity: 'medium',
    description: 'Lectura de temperatura inconsistente',
    occurred_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    resolved_by: '1',
    created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
  },
];

export function generateBatteryChartData(days: number = 30) {
  const data = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const baseBattery = 100 - (days - i) * (100 / (4 * 30));
    const battery = Math.max(10, Math.min(100, baseBattery + Math.random() * 5 - 2.5));

    data.push({
      date: date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      battery: Math.round(battery * 10) / 10,
    });
  }

  return data;
}

export function generateSignalChartData(days: number = 30) {
  const data = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const signal = -65 + Math.random() * 20 - 10;

    data.push({
      date: date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      signal: Math.round(signal * 10) / 10,
    });
  }

  return data;
}

export function generateUsageChartData(days: number = 30) {
  const data = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const usage = (days - i) * 24 + Math.random() * 24;

    data.push({
      date: date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      usage: Math.round(usage * 10) / 10,
    });
  }

  return data;
}
