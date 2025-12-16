/**
 * Input Validation Utility
 * Validate and sanitize user inputs for quality and security
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitized?: string;
}

export class InputValidator {
  /**
   * Validate chat message input
   */
  static validateChatMessage(input: string): ValidationResult {
    // Check if empty
    if (!input || input.trim().length === 0) {
      return {
        isValid: false,
        error: 'Message cannot be empty',
      };
    }

    // Check length
    if (input.length > 500) {
      return {
        isValid: false,
        error: 'Message is too long (max 500 characters)',
      };
    }

    // Check minimum length
    if (input.trim().length < 2) {
      return {
        isValid: false,
        error: 'Message is too short (min 2 characters)',
      };
    }

    // Remove excessive whitespace
    const sanitized = input.replace(/\s+/g, ' ').trim();

    return {
      isValid: true,
      sanitized,
    };
  }

  /**
   * Validate transaction amount
   */
  static validateAmount(amount: string): ValidationResult {
    // Check if empty
    if (!amount || amount.trim().length === 0) {
      return {
        isValid: false,
        error: 'Amount cannot be empty',
      };
    }

    // Check if it's a valid number
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
      return {
        isValid: false,
        error: 'Please enter a valid number',
      };
    }

    // Check if positive
    if (numAmount <= 0) {
      return {
        isValid: false,
        error: 'Amount must be greater than zero',
      };
    }

    // Check reasonable limits
    if (numAmount > 10000000) {
      return {
        isValid: false,
        error: 'Amount is too large',
      };
    }

    return {
      isValid: true,
      sanitized: numAmount.toFixed(2),
    };
  }

  /**
   * Validate transaction name
   */
  static validateTransactionName(name: string): ValidationResult {
    // Check if empty
    if (!name || name.trim().length === 0) {
      return {
        isValid: false,
        error: 'Transaction name cannot be empty',
      };
    }

    // Check length
    if (name.length > 100) {
      return {
        isValid: false,
        error: 'Transaction name is too long (max 100 characters)',
      };
    }

    // Check minimum length
    if (name.trim().length < 2) {
      return {
        isValid: false,
        error: 'Transaction name is too short (min 2 characters)',
      };
    }

    // Sanitize: remove excessive whitespace
    const sanitized = name.replace(/\s+/g, ' ').trim();

    return {
      isValid: true,
      sanitized,
    };
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): ValidationResult {
    if (!email || email.trim().length === 0) {
      return {
        isValid: false,
        error: 'Email cannot be empty',
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        isValid: false,
        error: 'Please enter a valid email address',
      };
    }

    return {
      isValid: true,
      sanitized: email.toLowerCase().trim(),
    };
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): ValidationResult {
    if (!password || password.length === 0) {
      return {
        isValid: false,
        error: 'Password cannot be empty',
      };
    }

    if (password.length < 6) {
      return {
        isValid: false,
        error: 'Password must be at least 6 characters',
      };
    }

    if (password.length > 128) {
      return {
        isValid: false,
        error: 'Password is too long (max 128 characters)',
      };
    }

    return {
      isValid: true,
    };
  }
}

