const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://Administrador:Password2026*@server-hector.postgres.database.azure.com:5432/postgres?sslmode=require",
});

async function setupMetrics() {
  try {
    const client = await pool.connect();
    console.log('Conectado a Azure PostgreSQL...');
    
    // Obtener un ID de beacon
    const res = await client.query('SELECT id FROM beacons LIMIT 1');
    if (res.rows.length === 0) {
      console.log('No se encontraron beacons. Crea uno primero.');
      return;
    }
    const beaconId = res.rows[0].id;
    
    console.log(`Generando métricas para beacon: ${beaconId}`);
    
    // Insertar 30 días de métricas ficticias
    let sql = 'INSERT INTO metrics (beacon_id, battery_level, signal_strength, temperature, humidity, timestamp) VALUES ';
    const values = [];
    const now = new Date();
    
    for (let i = 0; i < 30; i++) {
        const timestamp = new Date(now);
        timestamp.setDate(now.getDate() - i);
        
        const battery = 100 - (i * 2) + Math.floor(Math.random() * 5);
        const signal = -50 - Math.floor(Math.random() * 20);
        const temp = 20 + Math.floor(Math.random() * 10);
        const hum = 40 + Math.floor(Math.random() * 20);
        
        values.push(`('${beaconId}', ${Math.max(0, battery)}, ${signal}, ${temp}, ${hum}, '${timestamp.toISOString()}')`);
    }
    
    await client.query(sql + values.join(', ') + ';');
    console.log('30 registros de métricas insertados exitosamente.');
    
    client.release();
  } catch (err) {
    console.error('Error al configurar métricas:', err);
  } finally {
    pool.end();
  }
}

setupMetrics();
