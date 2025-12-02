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
  }

  export function open(options: {
    name: string;
    location?: string;
  }): QuickSQLiteConnection;
}
