import ApiError from './api-error';
import HttpStatus from './http-status';

export default class BadRequestError extends ApiError {
  constructor(message: string) {
    super(HttpStatus.BAD_REQUEST, message);
    this.name = 'BadRequestError';
  }
}
