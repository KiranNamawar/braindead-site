// Rate limiting utilities for API-like operations
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: () => string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      keyGenerator: () => 'default',
      ...config
    };
    
    // Clean up expired entries every minute
    setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  public isAllowed(): boolean {
    const key = this.config.keyGenerator!();
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      this.limits.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs
      });
      return true;
    }

    if (entry.count >= this.config.maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }

  public getRemainingRequests(): number {
    const key = this.config.keyGenerator!();
    const entry = this.limits.get(key);
    
    if (!entry || Date.now() > entry.resetTime) {
      return this.config.maxRequests;
    }
    
    return Math.max(0, this.config.maxRequests - entry.count);
  }

  public getResetTime(): number {
    const key = this.config.keyGenerator!();
    const entry = this.limits.get(key);
    
    if (!entry || Date.now() > entry.resetTime) {
      return Date.now() + this.config.windowMs;
    }
    
    return entry.resetTime;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }
}

// Pre-configured rate limiters for different operations
export const hashGeneratorLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60000, // 1 minute
  keyGenerator: () => 'hash_generation'
});

export const qrGeneratorLimiter = new RateLimiter({
  maxRequests: 50,
  windowMs: 60000, // 1 minute
  keyGenerator: () => 'qr_generation'
});

export const imageOptimizerLimiter = new RateLimiter({
  maxRequests: 20,
  windowMs: 60000, // 1 minute
  keyGenerator: () => 'image_optimization'
});

export const passwordGeneratorLimiter = new RateLimiter({
  maxRequests: 200,
  windowMs: 60000, // 1 minute
  keyGenerator: () => 'password_generation'
});

// Generic rate limiter factory
export const createRateLimiter = (config: RateLimitConfig): RateLimiter => {
  return new RateLimiter(config);
};

// Utility function to check rate limit with user feedback
export const checkRateLimit = (limiter: RateLimiter, operationName: string): boolean => {
  if (!limiter.isAllowed()) {
    const resetTime = new Date(limiter.getResetTime());
    const timeUntilReset = Math.ceil((limiter.getResetTime() - Date.now()) / 1000);
    
    throw new Error(
      `Rate limit exceeded for ${operationName}. ` +
      `Try again in ${timeUntilReset} seconds (resets at ${resetTime.toLocaleTimeString()}).`
    );
  }
  
  return true;
};