import { ERROR_CODES, HTTP_STATUS } from '../constants';

import { AppError } from './app-error';

export class ConflictError extends AppError {
  public constructor(message = 'Resource conflict') {
    super(message, HTTP_STATUS.CONFLICT, [], ERROR_CODES.CONFLICT);
  }
}
