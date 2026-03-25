const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/AZURE_POSTGRES_URL="(.+)"/);
const connectionString = match ? match[1] : null;

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function test() {
  try {
    const tables = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
    console.log('Tablas encontradas:', tables.rows.map(t => t.table_name).join(', ') || 'Ninguna');

    const userResult = await pool.query("SELECT id, username, role FROM users WHERE username = 'admin'");
    if (userResult.rows.length > 0) {
      console.log('✅ Usuario admin encontrado:', userResult.rows[0]);
    } else {
      console.log('❌ Usuario admin NO encontrado.');
    }
  } catch (err) {
    console.error('❌ ERROR:', err.message);
  } finally {
    await pool.end();
  }
}

test();
