import ApiError from './api-error';
import HttpStatus from './http-status';

export default class NotFoundError extends ApiError {
  constructor(message: string) {
    super(HttpStatus.NOT_FOUND, message);
    this.name = 'NotFoundError';
  }
}
