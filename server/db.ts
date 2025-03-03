import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

async function initializeDatabase(isProd: boolean): Promise<Database> {
  const db = await open({
    filename: isProd ? './db/prod.db' : 'C:/Workspace/devconn/server/db/dev.db', //./db/dev.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS secrets (
      key TEXT,
      value TEXT,
      creationDate INTEGER,
      expirationDate INTEGER,
      PRIMARY KEY (key, creationDate)
    );`);

  return db;
}

export default initializeDatabase;
