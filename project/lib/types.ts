export interface Beacon {
  id: string;
  device_id: string;
  name: string;
  model: string;
  status: 'active' | 'inactive' | 'disconnected' | 'maintenance';
  enrolled_at: string;
  last_seen: string;
  location: string;
  created_at: string;
  updated_at: string;
}

export interface Metric {
  id: string;
  beacon_id: string;
  battery_level: number;
  signal_strength: number;
  estimated_distance: number;
  usage_time: number;
  temperature: number;
  timestamp: string;
  created_at: string;
}

export interface Failure {
  id: string;
  beacon_id: string;
  failure_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  occurred_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
}

export interface Alert {
  id: string;
  beacon_id: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Prediction {
  id: string;
  beacon_id: string;
  failure_probability: number;
  estimated_time_to_fail: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  maintenance_recommended: boolean;
  confidence_score: number;
  model_version: string;
  created_at: string;
}

export interface Simulation {
  id: string;
  beacon_id: string | null;
  scenario_type: string;
  input_data: any;
  result_data: any;
  created_by: string | null;
  created_at: string;
}

export interface KPIData {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  status?: 'success' | 'warning' | 'danger' | 'info';
}

export interface ChartDataPoint {
  timestamp: string;
  value: number;
  label?: string;
}
