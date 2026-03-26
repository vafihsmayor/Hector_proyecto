/**
 * Utilidades para comunicación con la API (Next.js o Backend Externo)
 */

export async function loginRequest(username, password) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  const response = await fetch(`${apiUrl}/api/auth/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Credenciales inválidas');
  }

  return data;
}

export interface DashboardSummary {
  total_beacons: number;
  active_beacons: number;
  inactive_beacons: number;
  disconnected_beacons: number;
  maintenance_beacons: number;
  avg_battery: number;
  active_alerts: number;
}

export async function getBeacons() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const response = await fetch(`${apiUrl}/api/beacons/`);
  if (!response.ok) throw new Error('Error al obtener los beacons');
  return await response.json();
}

export async function createBeacon(beaconData: any) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const response = await fetch(`${apiUrl}/api/beacons/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(beaconData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Error al crear el beacon');
  }
  return await response.json();
}

export async function getBeaconMetrics(beaconId, days = 30) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const response = await fetch(`${apiUrl}/api/beacons/${beaconId}/metrics/?days=${days}`);
  if (!response.ok) throw new Error('Error al obtener las métricas');
  return await response.json();
}

export async function getAlerts(priority = 'all', status = 'all') {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const response = await fetch(`${apiUrl}/api/alerts/?priority=${priority}&status=${status}`);
  if (!response.ok) throw new Error('Error al obtener las alertas');
  return await response.json();
}

export async function updateAlertStatus(alertId, action) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const response = await fetch(`${apiUrl}/api/alerts/${alertId}/${action}/`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error(`Error al ${action} la alerta`);
  return await response.json();
}

export async function getDashboardSummary() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const response = await fetch(`${apiUrl}/api/dashboard/summary/`);
  if (!response.ok) throw new Error('Error al obtener el resumen del dashboard');
  return await response.json();
}
