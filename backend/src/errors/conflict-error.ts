import ApiError from './api-error';
import HttpStatus from './http-status';

export default class ConflictError extends ApiError {
  constructor(message: string) {
    super(HttpStatus.CONFLICT, message);
    this.name = 'ConflictError';
  }
}
