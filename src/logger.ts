import { isObject } from "./utils.js";

class Logger {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  log(message: string, data: unknown = undefined) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      name: this.name,
      timestamp,
      level: "INFO",
      message,
      ...(data
        ? { data: isObject(data) ? JSON.stringify(data) : data }
        : undefined),
    };
    console.error(JSON.stringify(logEntry));
  }

  error(message: string, error: Error | undefined = undefined) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      name: this.name,
      timestamp,
      level: "ERROR",
      message,
      ...(error
        ? error instanceof Error
          ? {
              error: error.stack || error.message || String(error),
            }
          : error
        : undefined),
    };
    console.error(JSON.stringify(logEntry));
  }
}

export default Logger;
