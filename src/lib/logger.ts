import { Prisma } from '@/generated/prisma/client';
import { inspect } from 'util';
import winston from 'winston';

const { combine, timestamp, colorize, errors } = winston.format;

const consoleFormat = combine(
  timestamp({ format: 'HH:mm:ss' }),
  colorize({ all: true }),
  errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `[${timestamp}] ${level}: ${message}`;

    // Clean up metadata: remove 'service' if it's the default one to reduce noise
    const cleanMeta = { ...metadata };
    if (cleanMeta.service === 'user-service') {
      delete cleanMeta.service;
    }

    // If there's any metadata left (like 'body' or 'result'), print it.
    // inspect, not JSON.stringify: error objects from HTTP clients (e.g.
    // Midtrans) are circular, and a throwing logger turns a warning into a 500.
    if (Object.keys(cleanMeta).length > 0) {
      msg += `\n${inspect(cleanMeta, { depth: 4, breakLength: 100 })}`;
    }

    return msg;
  }),
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
});

const prisma_error_instance = [
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientInitializationError,
  Prisma.PrismaClientRustPanicError,
  Prisma.PrismaClientValidationError,
];

export function logError(err: unknown, context: Record<string, unknown> = {}) {
  if (err instanceof Error) {
    if (prisma_error_instance.some((cls) => err instanceof cls)) {
      const maxLength = Number(process.env.MAX_LOG_ERROR_MESSAGE_LENGTH) || 200;
      const truncatedMessage = err.message.slice(0, maxLength);

      logger.error(`Prisma Error Occurred: ${truncatedMessage}...`, {
        name: err.name,
        clientVersion: (err as { clientVersion?: string }).clientVersion,
        ...context,
      });
    } else {
      logger.error(err.message, {
        name: err.name,
        ...context,
      });
    }
  } else {
    logger.error('Unknown error', { error: String(err), ...context });
  }
}
