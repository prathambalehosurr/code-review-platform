import { ERROR_CODES, HTTP_STATUS } from '../constants';

import { AppError } from './app-error';

export class ValidationError extends AppError {
  public constructor(message = 'Validation failed', errors: readonly unknown[] = []) {
    super(message, HTTP_STATUS.BAD_REQUEST, errors, ERROR_CODES.VALIDATION_ERROR);
  }
}
