import { ErrorRequestHandler } from 'express';
import { Error as MongooseError } from 'mongoose';
import multer from 'multer';
import ApiError from '../errors/api-error';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';

const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  let handledError = error;

  if (error instanceof Error && 'code' in error && error.code === 11000) {
    const duplicateError = error as Error & {
      keyPattern?: Record<string, unknown>;
    };
    const duplicateEmail = duplicateError.keyPattern
      ? 'email' in duplicateError.keyPattern
      : /\bemail_1\b/.test(error.message);
    const duplicateTitle = duplicateError.keyPattern
      ? 'title' in duplicateError.keyPattern
      : /\btitle_1\b/.test(error.message);

    if (duplicateEmail && req.path.endsWith('/register')) {
      handledError = new ConflictError('Пользователь с таким email уже существует');
    } else if (duplicateTitle && req.method === 'PATCH') {
      handledError = new ConflictError('Товар с таким заголовком уже существует');
    } else {
      handledError = new ConflictError(error.message);
    }
  } else if (error instanceof MongooseError.ValidationError) {
    handledError = new BadRequestError(error.message);
  } else if (error instanceof multer.MulterError) {
    handledError = new BadRequestError(error.message);
  } else if (error instanceof SyntaxError) {
    const requestError = error as SyntaxError & { status?: number; statusCode?: number };
    if (requestError.status === 400 || requestError.statusCode === 400) {
      handledError = new BadRequestError('Некорректный JSON');
    }
  }

  if (handledError instanceof ApiError) {
    res.status(handledError.statusCode).json({ message: handledError.message });
    return;
  }

  res.status(500).json({ message: 'Внутренняя ошибка сервера' });
};

export default errorHandler;
