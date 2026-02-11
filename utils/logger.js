import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
        return `${timestamp} [${level.toUpperCase()}]: ${message}${stack ? '\n' + stack : ''}`;
    })
);

// Create the logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    transports: [
        // Write all errors to error.log
        new winston.transports.File({
            filename: path.join(__dirname, '..', 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Write all logs to combined.log
        new winston.transports.File({
            filename: path.join(__dirname, '..', 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
    ],
});

// Add console output in development
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}
// Create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
    write: function (message, encoding) {
        // Use the 'info' log level so the output will be picked up by both transports (file and console)
        logger.info(message.trim());
    },
};

export default logger;
