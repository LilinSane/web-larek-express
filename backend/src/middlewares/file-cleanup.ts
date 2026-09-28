import { promises as fs } from 'fs';
import cron from 'node-cron';
import path from 'path';
import config from '../config';

export const cleanupTemporaryFiles = async () => {
  await fs.mkdir(config.temporaryDirectory, { recursive: true });
  const entries = await fs.readdir(config.temporaryDirectory, { withFileTypes: true });
  const now = Date.now();

  await Promise.all(entries.filter((entry) => entry.isFile()).map(async (entry) => {
    const filePath = path.join(config.temporaryDirectory, entry.name);
    const stats = await fs.stat(filePath);
    if (now - stats.mtimeMs > config.uploadTempMaxAge) {
      await fs.unlink(filePath);
    }
  }));
};

export const scheduleTemporaryFileCleanup = () => {
  cron.schedule(config.uploadCleanupCron, () => {
    cleanupTemporaryFiles().catch((error: Error) => {
      process.stderr.write(`Temporary file cleanup failed: ${error.message}\n`);
    });
  });
};
