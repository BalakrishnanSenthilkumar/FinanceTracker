/**
 * Cryptographic utilities for secure password hashing
 * Uses SHA-256 with random salt for password security
 */
import CryptoJS from 'crypto-js';

const SALT_LENGTH = 32; // 32 characters hex = 128 bits
const ITERATIONS = 10000; // PBKDF2 iterations for key stretching

/**
 * Generate a cryptographically secure random salt
 */
export const generateSalt = (): string => {
  return CryptoJS.lib.WordArray.random(SALT_LENGTH / 2).toString();
};

/**
 * Hash a password using PBKDF2 with SHA-256
 * This is a secure, industry-standard approach
 *
 * @param password - Plain text password
 * @param salt - Random salt (generate with generateSalt())
 * @returns Hashed password as hex string
 */
export const hashPassword = (password: string, salt: string): string => {
  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32, // 256 bits
    iterations: ITERATIONS,
    hasher: CryptoJS.algo.SHA256,
  });
  return key.toString();
};

/**
 * Verify a password against a stored hash
 *
 * @param password - Plain text password to verify
 * @param storedHash - Previously stored hash
 * @param salt - Salt used when creating the hash
 * @returns true if password matches
 */
export const verifyPassword = (
  password: string,
  storedHash: string,
  salt: string,
): boolean => {
  const hash = hashPassword(password, salt);
  return hash === storedHash;
};

/**
 * Generate a secure random token (for session IDs, etc.)
 *
 * @param length - Length of token in bytes (default 32)
 * @returns Random hex string
 */
export const generateSecureToken = (length: number = 32): string => {
  return CryptoJS.lib.WordArray.random(length).toString();
};

/**
 * Encrypt sensitive data using AES-256
 *
 * @param data - Data to encrypt
 * @param key - Encryption key
 * @returns Encrypted string
 */
export const encryptData = (data: string, key: string): string => {
  return CryptoJS.AES.encrypt(data, key).toString();
};

/**
 * Decrypt data encrypted with encryptData
 *
 * @param encryptedData - Encrypted string
 * @param key - Encryption key (same as used for encryption)
 * @returns Decrypted string
 */
export const decryptData = (encryptedData: string, key: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};
