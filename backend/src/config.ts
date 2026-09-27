import dotenv from 'dotenv';
import ms from 'ms';
import cron from 'node-cron';

dotenv.config();

const databaseUrl = process.env.DB_ADDRESS;
const jwtSecret = process.env.JWT_SECRET;
const uploadMaxSize = Number(process.env.UPLOAD_MAX_SIZE || 5 * 1024 * 1024);
const uploadTempMaxAge = ms(
  (process.env.UPLOAD_TEMP_MAX_AGE || '24h') as ms.StringValue,
);
const uploadCleanupCron = process.env.UPLOAD_CLEANUP_CRON || '0 * * * *';

if (!databaseUrl) {
  throw new Error('DB_ADDRESS must be configured in the environment');
}

if (!jwtSecret) {
  throw new Error('JWT_SECRET must be configured in the environment');
}

if (!Number.isSafeInteger(uploadMaxSize) || uploadMaxSize <= 0) {
  throw new Error('UPLOAD_MAX_SIZE must be a positive integer');
}

if (!Number.isFinite(uploadTempMaxAge) || uploadTempMaxAge <= 0) {
  throw new Error('UPLOAD_TEMP_MAX_AGE must be a valid positive duration');
}

if (!cron.validate(uploadCleanupCron)) {
  throw new Error('UPLOAD_CLEANUP_CRON must be a valid cron expression');
}

const config = {
  port: Number(process.env.PORT || 3000),
  databaseUrl,
  jwtSecret,
  originAllow: process.env.ORIGIN_ALLOW || 'http://localhost:5173',
  accessTokenExpiry: process.env.AUTH_ACCESS_TOKEN_EXPIRY || '10m',
  refreshTokenExpiry: process.env.AUTH_REFRESH_TOKEN_EXPIRY || '7d',
  uploadPath: process.env.UPLOAD_PATH || 'images',
  uploadPathTemp: process.env.UPLOAD_PATH_TEMP || 'temp',
  publicPath: process.env.PUBLIC_PATH || 'public',
  uploadMaxSize,
  uploadTempMaxAge,
  uploadCleanupCron,
};

export default config;
