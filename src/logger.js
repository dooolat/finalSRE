function shouldLog(currentLevel, incomingLevel) {
  const priority = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40
  };

  return priority[incomingLevel] >= priority[currentLevel];
}

export function createLogger({ serviceName, environment, version, logLevel }) {
  function write(level, message, fields = {}) {
    if (!shouldLog(logLevel, level)) {
      return;
    }

    const record = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: serviceName,
      environment,
      version,
      ...fields
    };

    const line = JSON.stringify(record);
    if (level === "error") {
      console.error(line);
      return;
    }

    console.log(line);
  }

  return {
    debug(message, fields) {
      write("debug", message, fields);
    },
    info(message, fields) {
      write("info", message, fields);
    },
    warn(message, fields) {
      write("warn", message, fields);
    },
    error(message, fields) {
      write("error", message, fields);
    }
  };
}
