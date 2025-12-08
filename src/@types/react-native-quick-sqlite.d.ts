declare module 'react-native-quick-sqlite' {
  export interface QuickSQLiteError extends Error {
    code?: string | number;
  }

  export interface QuickSQLiteResult {
    rowsAffected: number;
    insertId?: number;
    rows?: {
      length: number;
      item: (index: number) => any;
      _array: any[];
    };
  }

  export interface QuickSQLiteConnection {
    execute: (sql: string, params?: any[]) => QuickSQLiteResult;
    close: () => void;
  }

  export interface OpenOptions {
    name: string;
    location?: string;
    /**
     * SQLCipher encryption key
     * When provided, the database will be encrypted using SQLCipher
     */
    encryptionKey?: string;
  }

  export function open(options: OpenOptions): QuickSQLiteConnection;
}
