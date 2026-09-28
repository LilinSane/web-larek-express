import { mkdirSync } from 'fs';
import multer from 'multer';
import { randomUUID } from 'crypto';
import BadRequestError from '../errors/bad-request-error';
import config from '../config';

const { temporaryDirectory } = config;
const allowedTypes: Record<string, string> = {
  'image/jpg': '.jpg',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
};

mkdirSync(temporaryDirectory, { recursive: true });

const fileMiddleware = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, temporaryDirectory),
    filename: (_req, file, callback) => {
      const extension = allowedTypes[file.mimetype];
      callback(null, `${randomUUID()}${extension}`);
    },
  }),
  limits: {
    fileSize: config.uploadMaxSize,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedTypes[file.mimetype]) {
      callback(new BadRequestError(
        'Допустимы только изображения PNG, JPG, JPEG, GIF и SVG',
      ));
      return;
    }
    callback(null, true);
  },
});

export default fileMiddleware;
