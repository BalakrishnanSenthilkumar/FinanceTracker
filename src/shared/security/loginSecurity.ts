/**
 * Login Security Service
 * Implements rate limiting and account lockout for brute force protection
 */

interface LoginAttempt {
  count: number;
  firstAttempt: number;
  lockedUntil: number | null;
}

// In-memory store for login attempts (per email)
// In production, consider using AsyncStorage or database
const loginAttempts: Map<string, LoginAttempt> = new Map();

// Configuration
const MAX_ATTEMPTS = 5; // Maximum failed attempts before lockout
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
const ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minute window for counting attempts

/**
 * Check if an email is currently locked out
 */
export const isLockedOut = (
  email: string,
): { locked: boolean; remainingTime?: number } => {
  const normalizedEmail = email.toLowerCase().trim();
  const attempt = loginAttempts.get(normalizedEmail);

  if (!attempt || !attempt.lockedUntil) {
    return { locked: false };
  }

  const now = Date.now();
  if (attempt.lockedUntil > now) {
    const remainingTime = Math.ceil((attempt.lockedUntil - now) / 1000 / 60); // minutes
    return { locked: true, remainingTime };
  }

  // Lockout expired, reset attempts
  loginAttempts.delete(normalizedEmail);
  return { locked: false };
};

/**
 * Record a failed login attempt
 * Returns lockout status after recording
 */
export const recordFailedAttempt = (
  email: string,
): { locked: boolean; attemptsRemaining?: number; lockoutMinutes?: number } => {
  const normalizedEmail = email.toLowerCase().trim();
  const now = Date.now();

  let attempt = loginAttempts.get(normalizedEmail);

  if (!attempt) {
    // First failed attempt
    attempt = {
      count: 1,
      firstAttempt: now,
      lockedUntil: null,
    };
  } else {
    // Check if previous attempts are outside the window
    if (now - attempt.firstAttempt > ATTEMPT_WINDOW) {
      // Reset the window
      attempt = {
        count: 1,
        firstAttempt: now,
        lockedUntil: null,
      };
    } else {
      attempt.count += 1;
    }
  }

  // Check if we should lock out
  if (attempt.count >= MAX_ATTEMPTS) {
    attempt.lockedUntil = now + LOCKOUT_DURATION;
    loginAttempts.set(normalizedEmail, attempt);

    return {
      locked: true,
      lockoutMinutes: Math.ceil(LOCKOUT_DURATION / 1000 / 60),
    };
  }

  loginAttempts.set(normalizedEmail, attempt);

  return {
    locked: false,
    attemptsRemaining: MAX_ATTEMPTS - attempt.count,
  };
};

/**
 * Record a successful login (clears failed attempts)
 */
export const recordSuccessfulLogin = (email: string): void => {
  const normalizedEmail = email.toLowerCase().trim();
  loginAttempts.delete(normalizedEmail);
};

/**
 * Get remaining attempts for an email
 */
export const getRemainingAttempts = (email: string): number => {
  const normalizedEmail = email.toLowerCase().trim();
  const attempt = loginAttempts.get(normalizedEmail);

  if (!attempt) {
    return MAX_ATTEMPTS;
  }

  const now = Date.now();

  // Check if attempts are outside the window
  if (now - attempt.firstAttempt > ATTEMPT_WINDOW) {
    return MAX_ATTEMPTS;
  }

  return Math.max(0, MAX_ATTEMPTS - attempt.count);
};

/**
 * Manually unlock an account (for admin use)
 */
export const unlockAccount = (email: string): void => {
  const normalizedEmail = email.toLowerCase().trim();
  loginAttempts.delete(normalizedEmail);
};

/**
 * Clear all login attempts (for testing)
 */
export const clearAllAttempts = (): void => {
  loginAttempts.clear();
};
