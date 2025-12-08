import { QuickSQLiteError } from 'react-native-quick-sqlite';
import {
  generateSalt,
  hashPassword,
  verifyPassword,
  generateSecureToken,
  isLockedOut,
  recordFailedAttempt,
  recordSuccessfulLogin,
  storeSession,
  clearSession,
  getSession,
} from '../security';
import { getDatabase } from './database';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  salt: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface RegisterUserData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: Omit<User, 'password' | 'salt'>;
  attemptsRemaining?: number;
  lockedMinutes?: number;
}

/**
 * Generate a unique ID for new users
 */
const generateId = (): string => {
  return `user_${Date.now()}_${generateSecureToken(8)}`;
};

/**
 * Register a new user with secure password hashing
 */
export const registerUser = async (
  userData: RegisterUserData,
): Promise<AuthResult> => {
  const db = getDatabase();

  try {
    const normalizedEmail = userData.email.toLowerCase().trim();

    // Check if email already exists
    const existingUser = db.execute(
      'SELECT id FROM users WHERE email = ? LIMIT 1;',
      [normalizedEmail],
    );

    if (existingUser?.rows && existingUser?.rows?.length > 0) {
      return { success: false, error: 'Email already registered' };
    }

    // Generate secure salt and hash password
    const salt = generateSalt();
    const hashedPassword = hashPassword(userData.password, salt);
    const now = new Date().toISOString();

    const user: User = {
      id: generateId(),
      name: userData.name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      salt: salt,
      createdAt: now,
      updatedAt: now,
    };

    db.execute(
      `INSERT INTO users (id, name, email, password, salt, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [
        user.id,
        user.name,
        user.email,
        user.password,
        user.salt,
        user.createdAt,
        user.updatedAt,
      ],
    );

    // Return user without sensitive data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pwd, salt: _salt, ...safeUser } = user;
    return { success: true, user: safeUser };
  } catch (error) {
    const err = error as QuickSQLiteError;
    console.error('Failed to register user', err);
    return { success: false, error: 'Registration failed. Please try again.' };
  }
};

/**
 * Login user with secure password verification and rate limiting
 */
export const loginUser = async (
  credentials: UserCredentials,
): Promise<AuthResult> => {
  const normalizedEmail = credentials.email.toLowerCase().trim();

  // Check if account is locked out
  const lockStatus = isLockedOut(normalizedEmail);
  if (lockStatus.locked) {
    return {
      success: false,
      error: `Account temporarily locked. Try again in ${lockStatus.remainingTime} minutes.`,
      lockedMinutes: lockStatus.remainingTime,
    };
  }

  const db = getDatabase();

  try {
    // Get user with password and salt for verification
    const result = db.execute(
      'SELECT id, name, email, password, salt, createdAt, updatedAt FROM users WHERE email = ? LIMIT 1;',
      [normalizedEmail],
    );

    if (!result.rows || result.rows.length === 0) {
      // Record failed attempt even for non-existent users (prevents user enumeration)
      const attemptResult = recordFailedAttempt(normalizedEmail);
      return {
        success: false,
        error: 'Invalid email or password',
        attemptsRemaining: attemptResult.attemptsRemaining,
      };
    }

    const user = result.rows._array[0] as User;

    // Verify password using secure comparison
    const isValid = verifyPassword(
      credentials.password,
      user.password,
      user.salt,
    );

    if (!isValid) {
      const attemptResult = recordFailedAttempt(normalizedEmail);

      if (attemptResult.locked) {
        return {
          success: false,
          error: `Too many failed attempts. Account locked for ${attemptResult.lockoutMinutes} minutes.`,
          lockedMinutes: attemptResult.lockoutMinutes,
        };
      }

      return {
        success: false,
        error: 'Invalid email or password',
        attemptsRemaining: attemptResult.attemptsRemaining,
      };
    }

    // Clear failed attempts on successful login
    recordSuccessfulLogin(normalizedEmail);

    // Create and store secure session
    const sessionToken = generateSecureToken(32);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 day session

    await storeSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      token: sessionToken,
      expiresAt: expiresAt.toISOString(),
    });

    // Return user without sensitive data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _p, salt: _s, ...safeUser } = user;
    return { success: true, user: safeUser };
  } catch (error) {
    const err = error as QuickSQLiteError;
    console.error('Failed to login user', err);
    return { success: false, error: 'Login failed. Please try again.' };
  }
};

/**
 * Logout user - clear secure session
 */
export const logoutUser = async (): Promise<boolean> => {
  return await clearSession();
};

/**
 * Get current authenticated user from session
 */
export const getCurrentUser = async (): Promise<Omit<
  User,
  'password' | 'salt'
> | null> => {
  try {
    const session = await getSession();
    if (!session) {
      return null;
    }

    const db = getDatabase();
    const result = db.execute(
      'SELECT id, name, email, createdAt, updatedAt FROM users WHERE id = ? LIMIT 1;',
      [session.userId],
    );

    if (!result.rows || result.rows.length === 0) {
      await clearSession();
      return null;
    }

    return result.rows._array[0] as Omit<User, 'password' | 'salt'>;
  } catch (error) {
    console.error('Failed to get current user', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const session = await getSession();
  return session !== null;
};

/**
 * Get user by email (without sensitive data)
 */
export const getUserByEmail = async (
  email: string,
): Promise<Omit<User, 'password' | 'salt'> | null> => {
  const db = getDatabase();

  try {
    const result = db.execute(
      'SELECT id, name, email, createdAt, updatedAt FROM users WHERE email = ? LIMIT 1;',
      [email.toLowerCase().trim()],
    );

    if (!result.rows || result.rows.length === 0) {
      return null;
    }

    return result.rows._array[0] as Omit<User, 'password' | 'salt'>;
  } catch (error) {
    console.error('Failed to get user', error);
    return null;
  }
};

/**
 * Check if email exists
 */
export const emailExists = async (email: string): Promise<boolean> => {
  const db = getDatabase();

  try {
    const result = db.execute('SELECT id FROM users WHERE email = ? LIMIT 1;', [
      email.toLowerCase().trim(),
    ]);

    return (result.rows?.length ?? 0) > 0;
  } catch (error) {
    console.error('Failed to check email', error);
    return false;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  updates: { name?: string },
): Promise<AuthResult> => {
  const db = getDatabase();

  try {
    const updateFields: string[] = [];
    const values: any[] = [];

    if (updates.name) {
      updateFields.push('name = ?');
      values.push(updates.name.trim());
    }

    if (updateFields.length === 0) {
      return { success: false, error: 'No updates provided' };
    }

    updateFields.push('updatedAt = ?');
    values.push(new Date().toISOString());
    values.push(userId);

    db.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?;`,
      values,
    );

    const user = await getCurrentUser();
    return { success: true, user: user || undefined };
  } catch (error) {
    console.error('Failed to update user', error);
    return { success: false, error: 'Update failed. Please try again.' };
  }
};

/**
 * Change user password
 */
export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<AuthResult> => {
  const db = getDatabase();

  try {
    // Get current user with password
    const result = db.execute(
      'SELECT password, salt FROM users WHERE id = ? LIMIT 1;',
      [userId],
    );

    if (!result.rows || result.rows.length === 0) {
      return { success: false, error: 'User not found' };
    }

    const user = result.rows._array[0] as Pick<User, 'password' | 'salt'>;

    // Verify current password
    if (!verifyPassword(currentPassword, user.password, user.salt)) {
      return { success: false, error: 'Current password is incorrect' };
    }

    // Generate new salt and hash for new password
    const newSalt = generateSalt();
    const newHashedPassword = hashPassword(newPassword, newSalt);

    db.execute(
      'UPDATE users SET password = ?, salt = ?, updatedAt = ? WHERE id = ?;',
      [newHashedPassword, newSalt, new Date().toISOString(), userId],
    );

    return { success: true };
  } catch (error) {
    console.error('Failed to change password', error);
    return {
      success: false,
      error: 'Password change failed. Please try again.',
    };
  }
};
