import { ErrorRequestHandler } from 'express';
import { isCelebrateError } from 'celebrate';
import BadRequestError from '../errors/bad-request-error';

const validationErrorHandler: ErrorRequestHandler = (error, _req, _res, next) => {
  if (isCelebrateError(error) && error.details.has('params')) {
    next(new BadRequestError('Передан не валидный ID товара'));
    return;
  }

  next(error);
};

export default validationErrorHandler;
