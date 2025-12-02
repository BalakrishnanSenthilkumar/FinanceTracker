import {
  open,
  QuickSQLiteConnection,
  QuickSQLiteError,
} from 'react-native-quick-sqlite';
import { Transaction } from '../atoms/transactions';

const DB_NAME = 'finance_tracker.db';

let dbInstance: QuickSQLiteConnection | null = null;

const createTables = (db: QuickSQLiteConnection) => {
  db.execute(
    `CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      date TEXT NOT NULL
    );`,
    [],
  );
};

const getDatabase = (): QuickSQLiteConnection => {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    const db = open({ name: DB_NAME });
    createTables(db);
    dbInstance = db;
    return dbInstance;
  } catch (error) {
    console.error('Failed to open SQLite database', error);
    throw error;
  }
};

export const insertTransaction = async (transaction: Transaction) => {
  const db = getDatabase();

  const { id, name, type, amount, description, date } = transaction;

  try {
    db.execute(
      `INSERT OR REPLACE INTO transactions 
        (id, name, type, amount, description, date) 
       VALUES (?, ?, ?, ?, ?, ?);`,
      [id, name, type, amount, description, date],
    );
  } catch (error) {
    const err = error as QuickSQLiteError;
    console.error('Failed to insert transaction into SQLite', err);
    throw err;
  }
};

export const getTransactions = async () => {
  const db = getDatabase();
  const result = db.execute('SELECT * FROM transactions ORDER BY date DESC;');

  // quick-sqlite returns rows in result.rows
  console.log('result', result.rows?._array);
  return result.rows?._array || []; // this is already an array
};
