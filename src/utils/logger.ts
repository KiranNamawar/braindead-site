// Production logging utilities
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  stack?: string;
}

class Logger {
  private logLevel: LogLevel;
  private isProduction: boolean;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;

  constructor() {
    this.isProduction = import.meta.env.PROD;
    this.logLevel = this.isProduction ? LogLevel.WARN : LogLevel.DEBUG;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private createLogEntry(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      stack: error?.stack
    };
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Store in localStorage for debugging
    try {
      localStorage.setItem('app_logs', JSON.stringify(this.logs.slice(-100))); // Keep last 100
    } catch (e) {
      // Ignore storage errors
    }
  }

  public debug(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    
    const entry = this.createLogEntry(LogLevel.DEBUG, message, context);
    this.addLog(entry);
    
    if (!this.isProduction) {
      console.debug(`[DEBUG] ${message}`, context);
    }
  }

  public info(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    
    const entry = this.createLogEntry(LogLevel.INFO, message, context);
    this.addLog(entry);
    
    if (!this.isProduction) {
      console.info(`[INFO] ${message}`, context);
    }
  }

  public warn(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    
    const entry = this.createLogEntry(LogLevel.WARN, message, context);
    this.addLog(entry);
    
    console.warn(`[WARN] ${message}`, context);
  }

  public error(message: string, error?: Error, context?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    
    const entry = this.createLogEntry(LogLevel.ERROR, message, context, error);
    this.addLog(entry);
    
    console.error(`[ERROR] ${message}`, error, context);
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
    localStorage.removeItem('app_logs');
  }

  public exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Create singleton instance
export const logger = new Logger();

// Convenience functions
export const debug = (message: string, context?: Record<string, any>) => {
  logger.debug(message, context);
};

export const info = (message: string, context?: Record<string, any>) => {
  logger.info(message, context);
};

export const warn = (message: string, context?: Record<string, any>) => {
  logger.warn(message, context);
};

export const error = (message: string, err?: Error, context?: Record<string, any>) => {
  logger.error(message, err, context);
};