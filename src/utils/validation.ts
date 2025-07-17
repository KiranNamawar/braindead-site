// Input validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateHexColor = (color: string): boolean => {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color);
};

export const validateNumber = (value: string, min?: number, max?: number): boolean => {
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
};

export const sanitizeInput = (input: string): string => {
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/javascript:/gi, '')
              .replace(/on\w+\s*=/gi, '');
};

export const validateJSON = (jsonString: string): { isValid: boolean; error?: string } => {
  try {
    JSON.parse(jsonString);
    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : 'Invalid JSON' 
    };
  }
};

export const validatePasswordStrength = (password: string): {
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length < 8) {
    feedback.push('Password should be at least 8 characters long');
  } else {
    score += 20;
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('Add lowercase letters');
  } else {
    score += 20;
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('Add uppercase letters');
  } else {
    score += 20;
  }

  if (!/[0-9]/.test(password)) {
    feedback.push('Add numbers');
  } else {
    score += 20;
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    feedback.push('Add special characters');
  } else {
    score += 20;
  }

  return { score, feedback };
};