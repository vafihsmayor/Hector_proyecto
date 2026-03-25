const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://Administrador:Password2026*@server-hector.postgres.database.azure.com:5432/postgres?sslmode=require",
});

const sql = `
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    beacon_id UUID REFERENCES beacons(id),
    type TEXT NOT NULL,
    priority TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
`;

async function setupAlerts() {
  try {
    const client = await pool.connect();
    console.log('Conectado a Azure PostgreSQL...');
    await client.query(sql);
    console.log('Tabla "alerts" creada exitosamente.');
    
    // Insertar algunas alertas de ejemplo
    const insertSql = `
    INSERT INTO alerts (beacon_id, type, priority, message, status)
    SELECT id, 'Batería Baja', 'critical', 'Nivel de batería por debajo del 5%', 'active'
    FROM beacons LIMIT 1;
    `;
    await client.query(insertSql);
    console.log('Alerta de prueba insertada.');
    
    client.release();
  } catch (err) {
    console.error('Error al configurar alertas:', err);
  } finally {
    pool.end();
  }
}

setupAlerts();
