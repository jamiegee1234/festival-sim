import * as fs from 'fs';
import * as path from 'path';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  data?: any;
}

class Logger {
  private logLevel: LogLevel;
  private logToFile: boolean;
  private logFile: string;

  constructor() {
    this.logLevel = this.parseLogLevel(process.env.LOG_LEVEL || 'INFO');
    this.logToFile = process.env.LOG_TO_FILE === 'true';
    this.logFile = process.env.LOG_FILE || 'logs/festival-simulator.log';

    // Ensure log directory exists
    if (this.logToFile) {
      this.ensureLogDirectory();
    }
  }

  private parseLogLevel(level: string): LogLevel {
    switch (level.toUpperCase()) {
      case 'ERROR': return LogLevel.ERROR;
      case 'WARN': return LogLevel.WARN;
      case 'INFO': return LogLevel.INFO;
      case 'DEBUG': return LogLevel.DEBUG;
      default: return LogLevel.INFO;
    }
  }

  private ensureLogDirectory(): void {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const baseMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    
    if (data) {
      return `${baseMessage} ${JSON.stringify(data, null, 2)}`;
    }
    
    return baseMessage;
  }

  private writeLog(level: string, message: string, data?: any): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(data && { data })
    };

    // Console output with colors
    const colors = {
      ERROR: '\x1b[31m', // Red
      WARN: '\x1b[33m',  // Yellow
      INFO: '\x1b[36m',  // Cyan
      DEBUG: '\x1b[37m', // White
      RESET: '\x1b[0m'
    };

    const colorCode = colors[level as keyof typeof colors] || colors.INFO;
    const formattedMessage = this.formatMessage(level, message, data);
    
    console.log(`${colorCode}${formattedMessage}${colors.RESET}`);

    // File output
    if (this.logToFile) {
      try {
        fs.appendFileSync(this.logFile, `${JSON.stringify(logEntry)}\n`);
      } catch (error) {
        console.error('Failed to write to log file:', error);
      }
    }
  }

  error(message: string, data?: any): void {
    if (this.logLevel >= LogLevel.ERROR) {
      this.writeLog('ERROR', message, data);
    }
  }

  warn(message: string, data?: any): void {
    if (this.logLevel >= LogLevel.WARN) {
      this.writeLog('WARN', message, data);
    }
  }

  info(message: string, data?: any): void {
    if (this.logLevel >= LogLevel.INFO) {
      this.writeLog('INFO', message, data);
    }
  }

  debug(message: string, data?: any): void {
    if (this.logLevel >= LogLevel.DEBUG) {
      this.writeLog('DEBUG', message, data);
    }
  }

  // Specific logging methods for different types of events
  simulationEvent(eventType: string, data: any): void {
    this.info(`Simulation Event: ${eventType}`, data);
  }

  apiRequest(method: string, path: string, data?: any): void {
    this.info(`API Request: ${method} ${path}`, data);
  }

  socketEvent(eventType: string, clientId: string, data?: any): void {
    this.debug(`Socket Event: ${eventType} from client ${clientId}`, data);
  }

  performance(operation: string, duration: number, data?: any): void {
    this.debug(`Performance: ${operation} took ${duration}ms`, data);
  }
}

// Export singleton instance
export const logger = new Logger();