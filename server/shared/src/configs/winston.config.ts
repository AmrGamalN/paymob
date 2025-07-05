import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
const { combine, timestamp, printf, colorize } = format;
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();
const { NODE_ENV } = process.env;

const logFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level}: ${message}`;
});

export const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    colorize(),
    logFormat,
  ),
  transports: [
    ...(NODE_ENV === 'development' ? [new transports.Console()] : []),

    new DailyRotateFile({
      filename: path.join(process.cwd(), '/src/logs', 'error.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '7d',
      level: 'error',
    }),

    new DailyRotateFile({
      filename: path.join(process.cwd(), '/src/logs', 'combined.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '7d',
      level: 'info',
    }),
  ],
});
