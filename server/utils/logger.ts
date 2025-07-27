import { createHash } from "crypto";

export interface LogLevel {
  DEBUG: 0;
  INFO: 1;
  WARN: 2;
  ERROR: 3;
}

export interface LogEntry {
  timestamp: string;
  level: keyof LogLevel;
  message: string;
  data?: any;
  hash?: string;
}

class Logger {
  private logLevel: keyof LogLevel;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  constructor() {
    this.logLevel = (process.env.LOG_LEVEL as keyof LogLevel) || "INFO";
  }

  private shouldLog(level: keyof LogLevel): boolean {
    const levels: LogLevel = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
    return levels[level] >= levels[this.logLevel];
  }

  private formatMessage(
    level: keyof LogLevel,
    message: string,
    data?: any,
  ): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` ${JSON.stringify(data)}` : "";
    return `[${timestamp}] ${level}: ${message}${dataStr}`;
  }

  private addToMemory(
    level: keyof LogLevel,
    message: string,
    data?: any,
  ): void {
    const timestamp = new Date().toISOString();
    const hash = createHash("md5")
      .update(`${timestamp}-${message}`)
      .digest("hex")
      .slice(0, 8);

    const entry: LogEntry = {
      timestamp,
      level,
      message,
      data,
      hash,
    };

    this.logs.push(entry);

    // Manter apenas os últimos N logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  debug(message: string, data?: any): void {
    if (!this.shouldLog("DEBUG")) return;

    const formatted = this.formatMessage("DEBUG", message, data);
    console.log(formatted);
    this.addToMemory("DEBUG", message, data);
  }

  info(message: string, data?: any): void {
    if (!this.shouldLog("INFO")) return;

    const formatted = this.formatMessage("INFO", message, data);
    console.log(formatted);
    this.addToMemory("INFO", message, data);
  }

  warn(message: string, data?: any): void {
    if (!this.shouldLog("WARN")) return;

    const formatted = this.formatMessage("WARN", message, data);
    console.warn(formatted);
    this.addToMemory("WARN", message, data);
  }

  error(message: string, data?: any): void {
    if (!this.shouldLog("ERROR")) return;

    const formatted = this.formatMessage("ERROR", message, data);
    console.error(formatted);
    this.addToMemory("ERROR", message, data);
  }

  // Métodos utilitários
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  getLogsByLevel(level: keyof LogLevel): LogEntry[] {
    return this.logs.filter((log) => log.level === level);
  }

  clearLogs(): void {
    this.logs = [];
  }

  // Log de segurança específico
  security(message: string, data?: any): void {
    const securityData = {
      ...data,
      security: true,
      timestamp: new Date().toISOString(),
      ip: data?.ip || "unknown",
      userAgent: data?.userAgent || "unknown",
    };

    this.warn(`[SECURITY] ${message}`, securityData);
  }

  // Log de performance
  performance(message: string, duration: number, data?: any): void {
    const perfData = {
      ...data,
      duration: `${duration}ms`,
      performance: true,
    };

    if (duration > 1000) {
      this.warn(`[PERFORMANCE] ${message}`, perfData);
    } else {
      this.debug(`[PERFORMANCE] ${message}`, perfData);
    }
  }

  // Log de audit para compliance
  audit(action: string, user: string, data?: any): void {
    const auditData = {
      ...data,
      action,
      user,
      audit: true,
      timestamp: new Date().toISOString(),
    };

    this.info(`[AUDIT] ${action} by ${user}`, auditData);
  }
}

// Singleton instance
export const logger = new Logger();

// Export também as interfaces para uso em outros módulos
export type { LogEntry, LogLevel };
