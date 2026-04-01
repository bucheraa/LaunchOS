type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: unknown;
}

function log(level: LogLevel, message: string, data?: unknown) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    data,
  };

  if (process.env.NODE_ENV === "development") {
    const color = {
      debug: "\x1b[36m", // cyan
      info: "\x1b[32m", // green
      warn: "\x1b[33m", // yellow
      error: "\x1b[31m", // red
    }[level];
    console[level === "debug" ? "log" : level](
      `${color}[${entry.timestamp}] [${level.toUpperCase()}]\x1b[0m ${message}`,
      data ? data : ""
    );
  } else {
    // In production, output structured JSON for log aggregation
    console[level === "debug" ? "log" : level](JSON.stringify(entry));
  }
}

export const logger = {
  debug: (message: string, data?: unknown) => log("debug", message, data),
  info: (message: string, data?: unknown) => log("info", message, data),
  warn: (message: string, data?: unknown) => log("warn", message, data),
  error: (message: string, data?: unknown) => log("error", message, data),
};
