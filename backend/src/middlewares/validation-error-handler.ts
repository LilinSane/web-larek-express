import { ErrorRequestHandler } from 'express';
import { isCelebrateError } from 'celebrate';
import BadRequestError from '../errors/bad-request-error';

const validationErrorHandler: ErrorRequestHandler = (error, _req, _res, next) => {
  if (isCelebrateError(error)) {
    if (error.details.has('params')) {
      next(new BadRequestError('Передан не валидный ID товара'));
      return;
    }

    const validationMessages = [...error.details.values()]
      .flatMap(({ details }) => details.map(({ message }) => message));
    next(new BadRequestError(validationMessages.join('; ') || error.message));
    return;
  }

  next(error);
};

export default validationErrorHandler;
