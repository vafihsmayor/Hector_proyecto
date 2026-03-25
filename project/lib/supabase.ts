import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  users: {
    id: string;
    username: string;
    email: string;
    password_hash: string;
    role: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  beacons: {
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
  };
  metrics: {
    id: string;
    beacon_id: string;
    battery_level: number;
    signal_strength: number;
    estimated_distance: number;
    usage_time: number;
    temperature: number;
    timestamp: string;
    created_at: string;
  };
  failures: {
    id: string;
    beacon_id: string;
    failure_type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    occurred_at: string;
    resolved_at: string | null;
    resolved_by: string | null;
    created_at: string;
  };
  alerts: {
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
  };
  predictions: {
    id: string;
    beacon_id: string;
    failure_probability: number;
    estimated_time_to_fail: number;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    maintenance_recommended: boolean;
    confidence_score: number;
    model_version: string;
    created_at: string;
  };
  simulations: {
    id: string;
    beacon_id: string | null;
    scenario_type: string;
    input_data: any;
    result_data: any;
    created_by: string | null;
    created_at: string;
  };
  maintenance_reports: {
    id: string;
    beacon_id: string | null;
    report_type: string;
    start_date: string;
    end_date: string;
    file_url: string;
    file_type: 'pdf' | 'excel';
    generated_by: string | null;
    generated_at: string;
  };
};
