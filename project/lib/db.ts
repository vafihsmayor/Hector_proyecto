import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.AZURE_POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false, // Requerido para Azure PostgreSQL en gran parte de las configuraciones
  },
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export default pool;
