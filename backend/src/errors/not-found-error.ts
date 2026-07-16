import { ERROR_CODES, HTTP_STATUS } from '../constants';

import { AppError } from './app-error';

export class NotFoundError extends AppError {
  public constructor(message = 'Resource not found') {
    super(message, HTTP_STATUS.NOT_FOUND, [], ERROR_CODES.NOT_FOUND);
  }
}
