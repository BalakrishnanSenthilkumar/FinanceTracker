/**
 * Database Module Exports
 */

// Database manager
export {
  initializeDatabase,
  getDatabase,
  isDatabaseInitialized,
  closeDatabase,
} from './database';

// User operations
export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  isAuthenticated,
  getUserByEmail,
  emailExists,
  updateUserProfile,
  changePassword,
} from './usersDB';
export type {
  User,
  UserCredentials,
  RegisterUserData,
  AuthResult,
} from './usersDB';

// Transaction operations
export {
  insertTransaction,
  getTransactions,
  getTransactionsByUserId,
  deleteTransaction,
  getTransactionCount,
} from './transactionsDB';

