import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import config from './config';
import NotFoundError from './errors/not-found-error';
import errorHandler from './middlewares/error-handler';
import logger from './middlewares/logger';
import validationErrorHandler from './middlewares/validation-error-handler';
import { cleanupTemporaryFiles, scheduleTemporaryFileCleanup } from './middlewares/file-cleanup';
import routes from './routes';

const app = express();

app.use(logger.requestLogger);
app.use(cors({
  origin: config.originAllow,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(config.publicDirectory));

app.use(routes);
app.use((req, _res, next) => {
  next(new NotFoundError(`Маршрут ${req.method} ${req.path} не найден`));
});
app.use(logger.errorLogger);
app.use(validationErrorHandler);
app.use(errorHandler);

mongoose.connect(config.databaseUrl)
  .then(() => {
    cleanupTemporaryFiles().catch((error: Error) => {
      process.stderr.write(`Temporary file cleanup failed: ${error.message}\n`);
    });
    scheduleTemporaryFileCleanup();
    app.listen(config.port);
  })
  .catch((error: Error) => {
    process.stderr.write(`MongoDB connection failed: ${error.message}\n`);
    process.exit(1);
  });
