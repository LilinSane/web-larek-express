import ApiError from './api-error';

export default class BadRequestError extends ApiError {
  constructor(message: string) {
    super(400, message);
    this.name = 'BadRequestError';
  }
}
