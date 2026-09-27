import ApiError from './api-error';

export default class UnauthorizedError extends ApiError {
  constructor(message = 'Необходима авторизация') {
    super(401, message);
    this.name = 'UnauthorizedError';
  }
}
