/**
 * Utilidades para comunicación con la API (Next.js o Backend Externo)
 */

const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: any = {
    ...options.headers,
    'Content-Type': options.body ? 'application/json' : undefined,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${getApiUrl()}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && typeof window !== 'undefined' && window.location.pathname !== '/login') {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  }

  return response;
}

export async function downloadFile(endpoint: string, fileName: string) {
  const response = await fetchWithAuth(endpoint);
  if (!response.ok) throw new Error('Error al descargar el archivo');

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export async function loginRequest(username, password) {
  const response = await fetch(`${getApiUrl()}/api/auth/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Credenciales inválidas');
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
  const response = await fetchWithAuth('/api/beacons/');
  if (!response.ok) throw new Error('Error al obtener los beacons');
  return await response.json();
}

export async function createBeacon(beaconData: any) {
  const response = await fetchWithAuth('/api/beacons/', {
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
  const response = await fetchWithAuth(`/api/beacons/${beaconId}/metrics/?days=${days}`);
  if (!response.ok) throw new Error('Error al obtener las métricas');
  return await response.json();
}

export async function getAlerts(priority = 'all', status = 'all') {
  const response = await fetchWithAuth(`/api/alerts/?priority=${priority}&status=${status}`);
  if (!response.ok) throw new Error('Error al obtener las alertas');
  return await response.json();
}

export async function updateAlertStatus(alertId, action) {
  const response = await fetchWithAuth(`/api/alerts/${alertId}/${action}/`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error(`Error al ${action} la alerta`);
  return await response.json();
}

export async function getDashboardSummary() {
  const response = await fetchWithAuth('/api/dashboard/summary/');
  if (!response.ok) throw new Error('Error al obtener el resumen del dashboard');
  return await response.json();
}
