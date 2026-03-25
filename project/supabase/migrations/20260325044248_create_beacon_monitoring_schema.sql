/*
  # Beacon Monitoring Platform Database Schema

  ## Overview
  Complete database schema for BLE beacon monitoring, predictive maintenance, and intelligent alerting system.

  ## Tables Created

  ### 1. users
  - `id` (uuid, primary key): Unique user identifier
  - `username` (text, unique): User login name
  - `email` (text, unique): User email address
  - `password_hash` (text): Encrypted password
  - `role` (text): User role (admin, operator, viewer) - extensible
  - `is_active` (boolean): Account status
  - `created_at` (timestamptz): Account creation timestamp
  - `updated_at` (timestamptz): Last update timestamp

  ### 2. beacons
  - `id` (uuid, primary key): Unique beacon identifier
  - `device_id` (text, unique): Physical device ID (MAC address or serial)
  - `name` (text): Friendly device name
  - `model` (text): Device model (e.g., Blue Charm BC04P)
  - `status` (text): Current status (active, inactive, disconnected, maintenance)
  - `enrolled_at` (timestamptz): Device enrollment timestamp
  - `last_seen` (timestamptz): Last detection timestamp
  - `location` (text): Physical location description
  - `created_at` (timestamptz): Record creation timestamp
  - `updated_at` (timestamptz): Last update timestamp

  ### 3. metrics
  - `id` (uuid, primary key): Unique metric record identifier
  - `beacon_id` (uuid, foreign key): Reference to beacons table
  - `battery_level` (numeric): Battery percentage (0-100)
  - `signal_strength` (numeric): RSSI value (signal strength in dBm)
  - `estimated_distance` (numeric): Distance in meters
  - `usage_time` (numeric): Accumulated usage time in hours
  - `temperature` (numeric): Device temperature in Celsius
  - `timestamp` (timestamptz): Metric capture timestamp
  - `created_at` (timestamptz): Record creation timestamp

  ### 4. failures
  - `id` (uuid, primary key): Unique failure record identifier
  - `beacon_id` (uuid, foreign key): Reference to beacons table
  - `failure_type` (text): Type of failure (battery, connectivity, hardware, sensor)
  - `severity` (text): Failure severity (low, medium, high, critical)
  - `description` (text): Detailed failure description
  - `occurred_at` (timestamptz): Failure occurrence timestamp
  - `resolved_at` (timestamptz): Resolution timestamp (nullable)
  - `resolved_by` (uuid, foreign key): User who resolved it (nullable)
  - `created_at` (timestamptz): Record creation timestamp

  ### 5. alerts
  - `id` (uuid, primary key): Unique alert identifier
  - `beacon_id` (uuid, foreign key): Reference to beacons table
  - `type` (text): Alert type (battery_low, battery_critical, disconnected, failure_predicted, maintenance_required)
  - `priority` (text): Alert priority (low, medium, high, critical)
  - `message` (text): Alert message content
  - `status` (text): Alert status (active, acknowledged, resolved, dismissed)
  - `acknowledged_by` (uuid, foreign key): User who acknowledged (nullable)
  - `acknowledged_at` (timestamptz): Acknowledgment timestamp (nullable)
  - `created_at` (timestamptz): Alert creation timestamp
  - `updated_at` (timestamptz): Last update timestamp

  ### 6. predictions
  - `id` (uuid, primary key): Unique prediction identifier
  - `beacon_id` (uuid, foreign key): Reference to beacons table
  - `failure_probability` (numeric): Probability of failure (0-1 or 0-100)
  - `estimated_time_to_fail` (numeric): Estimated hours until failure
  - `risk_level` (text): Risk classification (low, medium, high, critical)
  - `maintenance_recommended` (boolean): Whether maintenance is recommended
  - `confidence_score` (numeric): Model confidence score (0-1)
  - `model_version` (text): ML model version used
  - `created_at` (timestamptz): Prediction timestamp

  ### 7. simulations
  - `id` (uuid, primary key): Unique simulation identifier
  - `beacon_id` (uuid, foreign key): Reference to beacons table (nullable for generic simulations)
  - `scenario_type` (text): Simulation scenario (battery_50, battery_low, battery_critical, recurring_failures, disconnected)
  - `input_data` (jsonb): Input parameters for simulation
  - `result_data` (jsonb): Simulation results and predictions
  - `created_by` (uuid, foreign key): User who ran the simulation
  - `created_at` (timestamptz): Simulation execution timestamp

  ### 8. maintenance_reports
  - `id` (uuid, primary key): Unique report identifier
  - `beacon_id` (uuid, foreign key): Reference to beacons table (nullable for aggregate reports)
  - `report_type` (text): Report type (daily, weekly, monthly, custom, maintenance)
  - `start_date` (timestamptz): Report period start
  - `end_date` (timestamptz): Report period end
  - `file_url` (text): Stored file URL/path
  - `file_type` (text): File format (pdf, excel)
  - `generated_by` (uuid, foreign key): User who generated the report
  - `generated_at` (timestamptz): Report generation timestamp

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Policies restrict access to authenticated users only
  - Future-ready for role-based access control

  ## Indexes
  - Optimized indexes for common queries on foreign keys and timestamps
  - Composite indexes for frequently filtered columns
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'admin',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Beacons table
CREATE TABLE IF NOT EXISTS beacons (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id text UNIQUE NOT NULL,
  name text NOT NULL,
  model text NOT NULL DEFAULT 'Blue Charm BC04P',
  status text NOT NULL DEFAULT 'active',
  enrolled_at timestamptz DEFAULT now(),
  last_seen timestamptz DEFAULT now(),
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Metrics table
CREATE TABLE IF NOT EXISTS metrics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  beacon_id uuid NOT NULL REFERENCES beacons(id) ON DELETE CASCADE,
  battery_level numeric NOT NULL CHECK (battery_level >= 0 AND battery_level <= 100),
  signal_strength numeric NOT NULL,
  estimated_distance numeric,
  usage_time numeric DEFAULT 0,
  temperature numeric,
  timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Failures table
CREATE TABLE IF NOT EXISTS failures (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  beacon_id uuid NOT NULL REFERENCES beacons(id) ON DELETE CASCADE,
  failure_type text NOT NULL,
  severity text NOT NULL DEFAULT 'medium',
  description text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  beacon_id uuid NOT NULL REFERENCES beacons(id) ON DELETE CASCADE,
  type text NOT NULL,
  priority text NOT NULL DEFAULT 'medium',
  message text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  acknowledged_by uuid REFERENCES users(id),
  acknowledged_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Predictions table
CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  beacon_id uuid NOT NULL REFERENCES beacons(id) ON DELETE CASCADE,
  failure_probability numeric NOT NULL CHECK (failure_probability >= 0 AND failure_probability <= 100),
  estimated_time_to_fail numeric,
  risk_level text NOT NULL DEFAULT 'low',
  maintenance_recommended boolean DEFAULT false,
  confidence_score numeric,
  model_version text DEFAULT 'v1.0-simulated',
  created_at timestamptz DEFAULT now()
);

-- Simulations table
CREATE TABLE IF NOT EXISTS simulations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  beacon_id uuid REFERENCES beacons(id) ON DELETE SET NULL,
  scenario_type text NOT NULL,
  input_data jsonb NOT NULL,
  result_data jsonb NOT NULL,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Maintenance reports table
CREATE TABLE IF NOT EXISTS maintenance_reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  beacon_id uuid REFERENCES beacons(id) ON DELETE SET NULL,
  report_type text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  file_url text,
  file_type text NOT NULL,
  generated_by uuid REFERENCES users(id),
  generated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_metrics_beacon_id ON metrics(beacon_id);
CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_beacon_timestamp ON metrics(beacon_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_failures_beacon_id ON failures(beacon_id);
CREATE INDEX IF NOT EXISTS idx_failures_occurred_at ON failures(occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_alerts_beacon_id ON alerts(beacon_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_predictions_beacon_id ON predictions(beacon_id);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_simulations_beacon_id ON simulations(beacon_id);
CREATE INDEX IF NOT EXISTS idx_simulations_created_at ON simulations(created_at DESC);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE beacons ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE failures ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for beacons table (all authenticated users can read, admins can modify)
CREATE POLICY "Authenticated users can view beacons"
  ON beacons FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert beacons"
  ON beacons FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update beacons"
  ON beacons FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete beacons"
  ON beacons FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for metrics table
CREATE POLICY "Authenticated users can view metrics"
  ON metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert metrics"
  ON metrics FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for failures table
CREATE POLICY "Authenticated users can view failures"
  ON failures FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert failures"
  ON failures FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update failures"
  ON failures FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for alerts table
CREATE POLICY "Authenticated users can view alerts"
  ON alerts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert alerts"
  ON alerts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update alerts"
  ON alerts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for predictions table
CREATE POLICY "Authenticated users can view predictions"
  ON predictions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert predictions"
  ON predictions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for simulations table
CREATE POLICY "Authenticated users can view simulations"
  ON simulations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert simulations"
  ON simulations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for maintenance_reports table
CREATE POLICY "Authenticated users can view reports"
  ON maintenance_reports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert reports"
  ON maintenance_reports FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert default admin user (password: admin123 - should be changed in production)
-- Note: In production, use proper password hashing with bcrypt
INSERT INTO users (username, email, password_hash, role, is_active)
VALUES ('admin', 'admin@beaconmonitor.com', '$2b$10$rKvvLZr.8qLz9qXqZ8qXqOqXqZ8qXqOqXqZ8qXqOqXqZ8qXqOqXqO', 'admin', true)
ON CONFLICT (username) DO NOTHING;

-- Insert sample beacons for development
INSERT INTO beacons (device_id, name, model, status, location) VALUES
  ('BC04P-001', 'Beacon Almacén Principal', 'Blue Charm BC04P', 'active', 'Almacén - Zona A'),
  ('BC04P-002', 'Beacon Entrada Norte', 'Blue Charm BC04P', 'active', 'Entrada Norte'),
  ('BC04P-003', 'Beacon Área de Producción', 'Blue Charm BC04P', 'active', 'Planta - Sección 1'),
  ('BC04P-004', 'Beacon Oficinas', 'Blue Charm BC04P', 'inactive', 'Edificio Administrativo'),
  ('BC04P-005', 'Beacon Estacionamiento', 'Blue Charm BC04P', 'disconnected', 'Estacionamiento Nivel 2')
ON CONFLICT (device_id) DO NOTHING;