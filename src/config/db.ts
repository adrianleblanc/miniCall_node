import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const poolConfig = process.env.POSTGRES_URL 
  ? { connectionString: process.env.POSTGRES_URL }
  : {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'minicallcenter',
      password: process.env.DB_PASSWORD || 'postgres',
      port: parseInt(process.env.DB_PORT || '5432', 10),
    };

const pool = new Pool(poolConfig);

// Prueba de conexión
pool.on('connect', () => {
  console.log('Conexión a la base de datos PostgreSQL exitosa');
});

pool.on('error', (err) => {
  console.error('Error inesperado en el cliente PostgreSQL', err);
  process.exit(-1);
});

export default pool;
