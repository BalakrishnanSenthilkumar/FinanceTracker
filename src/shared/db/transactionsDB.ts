import { QuickSQLiteError } from 'react-native-quick-sqlite';
import { Transaction } from '../atoms/transactions';
import { getDatabase } from './database';

/**
 * Insert or update a transaction in the encrypted database
 */
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

/**
 * Get all transactions from the encrypted database
 */
export const getTransactions = async (): Promise<Transaction[]> => {
  const db = getDatabase();
  const result = db.execute('SELECT * FROM transactions ORDER BY date DESC;');

  return result.rows?._array || [];
};

/**
 * Get transactions for a specific user
 */
export const getTransactionsByUserId = async (
  userId: string,
): Promise<Transaction[]> => {
  const db = getDatabase();
  const result = db.execute(
    'SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC;',
    [userId],
  );

  return result.rows?._array || [];
};

/**
 * Delete a transaction by ID
 */
export const deleteTransaction = async (id: string): Promise<boolean> => {
  const db = getDatabase();

  try {
    db.execute('DELETE FROM transactions WHERE id = ?;', [id]);
    return true;
  } catch (error) {
    console.error('Failed to delete transaction', error);
    return false;
  }
};

/**
 * Get transaction count
 */
export const getTransactionCount = async (): Promise<number> => {
  const db = getDatabase();
  const result = db.execute('SELECT COUNT(*) as count FROM transactions;');

  return result.rows?._array[0]?.count || 0;
};
