import mysql from "mysql2/promise";

// Persistence is optional. When DB_* env vars are absent the app runs exactly
// as before (in-memory only). Set them (see docker-compose.yml) to persist
// workflow state to MariaDB/MySQL.

let pool: mysql.Pool | null = null;

export function dbEnabled(): boolean {
  return Boolean(process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER);
}

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: Number(process.env.DB_POOL || 5),
      maxIdle: Number(process.env.DB_POOL || 5),
      idleTimeout: 60000,
      enableKeepAlive: true,
    });
  }
  return pool;
}
