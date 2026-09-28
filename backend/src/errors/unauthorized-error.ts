import ApiError from './api-error';
import HttpStatus from './http-status';

export default class UnauthorizedError extends ApiError {
  constructor(message = 'Необходима авторизация') {
    super(HttpStatus.UNAUTHORIZED, message);
    this.name = 'UnauthorizedError';
  }
}
