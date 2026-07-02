const winston = require("winston");
require("winston-daily-rotate-file");
const path = require("path");
const logDir = path.join(process.cwd(), "src/config");
const logger = winston.createLogger({
  level: "info",

  transports: [
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, "combined-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxFiles: "30d",
    }),

    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, "error-%DATE%.log"),
      level: "error",
      datePattern: "YYYY-MM-DD",
      maxFiles: "30d",
    }),

    new winston.transports.Console(),
  ],
});

module.exports = logger;
