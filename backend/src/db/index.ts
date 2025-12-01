/**
 * Database connection and initialization
 * Uses better-sqlite3 for Node.js compatibility (Bun also supports this)
 */
import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ESM compatibility for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirnamePath = dirname(__filename);

// Support configurable DB path for Docker, default to local
const DB_PATH = process.env.DB_PATH || join(__dirnamePath, '../../pager.db');
const SCHEMA_PATH = join(__dirnamePath, 'schema.sql');

let db: Database.Database | null = null;

/**
 * Initialize database connection and schema
 */
export function initDatabase(): Database.Database {
  if (db) {
    return db;
  }

  // Create database connection
  db = new Database(DB_PATH);

  // Enable WAL mode for better concurrent read performance
  db.pragma('journal_mode = WAL');

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Read and execute schema
  const schema = readFileSync(SCHEMA_PATH, 'utf-8');
  db.exec(schema);

  console.log('✅ Database initialized at:', DB_PATH);

  return db;
}

/**
 * Get database instance
 */
export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    console.log('Database connection closed');
  }
}

// Export database instance
export { db };
