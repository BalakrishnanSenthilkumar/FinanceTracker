/**
 * Encrypted Database Manager
 * Centralized database access with SQLCipher encryption
 */
import { open, QuickSQLiteConnection } from 'react-native-quick-sqlite';
import { getDatabaseEncryptionKey } from '../security/databaseEncryption';

const DB_NAME = 'finance_tracker_secure.db';

let dbInstance: QuickSQLiteConnection | null = null;
let encryptionKey: string | null = null;
let isInitialized = false;

/**
 * Initialize the encrypted database
 * Must be called once at app startup before any database operations
 */
export const initializeDatabase = async (): Promise<void> => {
  if (isInitialized && dbInstance) {
    return;
  }

  try {
    // Get or create encryption key from secure storage
    encryptionKey = await getDatabaseEncryptionKey();

    // Open encrypted database
    dbInstance = open({
      name: DB_NAME,
      encryptionKey: encryptionKey,
    });

    // Create all tables
    createTables(dbInstance);

    isInitialized = true;
    console.log('[Database] Encrypted database initialized successfully');
  } catch (error) {
    console.error('[Database] Failed to initialize encrypted database:', error);
    throw error;
  }
};

/**
 * Create all application tables
 */
const createTables = (db: QuickSQLiteConnection) => {
  // Users table
  db.execute(
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      salt TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );`,
    [],
  );

  // Index on email for faster lookups
  db.execute('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);', []);

  // Transactions table
  db.execute(
    `CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      userId TEXT,
      FOREIGN KEY (userId) REFERENCES users(id)
    );`,
    [],
  );

  // Index on userId for faster transaction lookups
  db.execute(
    'CREATE INDEX IF NOT EXISTS idx_transactions_userId ON transactions(userId);',
    [],
  );
};

/**
 * Get the database instance
 * Throws error if database is not initialized
 */
export const getDatabase = (): QuickSQLiteConnection => {
  if (!dbInstance || !isInitialized) {
    throw new Error(
      'Database not initialized. Call initializeDatabase() first at app startup.',
    );
  }
  return dbInstance;
};

/**
 * Check if database is initialized
 */
export const isDatabaseInitialized = (): boolean => {
  return isInitialized && dbInstance !== null;
};

/**
 * Close the database connection
 */
export const closeDatabase = (): void => {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    isInitialized = false;
    console.log('[Database] Database connection closed');
  }
};

/**
 * Re-key the database with a new encryption key
 * WARNING: This is a destructive operation if it fails midway
 */
export const rekeyDatabase = async (newKey: string): Promise<boolean> => {
  if (!dbInstance) {
    return false;
  }

  try {
    // SQLCipher rekey command
    dbInstance.execute(`PRAGMA rekey = '${newKey}';`, []);
    encryptionKey = newKey;
    console.log('[Database] Database re-keyed successfully');
    return true;
  } catch (error) {
    console.error('[Database] Failed to re-key database:', error);
    return false;
  }
};
