import { isObject } from "./utils.js";

class Logger {
  private name: string | undefined;
  private logsToStderr: boolean;

  constructor(
    name: string | undefined = undefined,
    { logsToStderr = false }: { logsToStderr?: boolean } = {}
  ) {
    this.name = name;
    this.logsToStderr = logsToStderr;
  }

  private log(level: string, message: string, data: unknown = undefined) {
    let dataOutput = undefined;
    if (data) {
      if (data instanceof Error) {
        dataOutput = {
          error: data.stack || data.message || String(data),
        };
      } else if (isObject(data)) {
        dataOutput = JSON.stringify(data);
      } else {
        dataOutput = String(data);
      }
    }

    const logEntry = {
      time: new Date().toISOString(),
      level_name: level,
      message: `${this.name ? `[${this.name}] ` : ""}${message}`,
      data: dataOutput,
    };
    const logString = JSON.stringify(logEntry);
    if (this.logsToStderr || level === "ERROR") {
      console.error(logString);
    } else {
      console.log(logString);
    }
  }

  error(message: string, error: Error | undefined = undefined) {
    this.log("error", message, error);
  }

  warn(message: string, data: unknown = undefined) {
    this.log("warn", message, data);
  }

  info(message: string, data: unknown = undefined) {
    this.log("info", message, data);
  }
}

export default Logger;
