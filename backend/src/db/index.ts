/**
 * Database connection and initialization
 */
import { Database } from 'bun:sqlite';
import { readFileSync } from 'fs';
import { join } from 'path';

const DB_PATH = join(__dirname, '../../pager.db');
const SCHEMA_PATH = join(__dirname, 'schema.sql');

let db: Database | null = null;

/**
 * Initialize database connection and schema
 */
export function initDatabase(): Database {
  if (db) {
    return db;
  }

  // Create database connection
  db = new Database(DB_PATH);

  // Enable WAL mode for better concurrent read performance
  db.run('PRAGMA journal_mode = WAL');

  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');

  // Read and execute schema
  const schema = readFileSync(SCHEMA_PATH, 'utf-8');
  db.exec(schema);

  console.log('✅ Database initialized at:', DB_PATH);

  return db;
}

/**
 * Get database instance
 */
export function getDatabase(): Database {
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
