import { ERROR_CODES, HTTP_STATUS } from '../constants';

import { AppError } from './app-error';

export class AuthorizationError extends AppError {
  public constructor(message = 'Forbidden') {
    super(message, HTTP_STATUS.FORBIDDEN, [], ERROR_CODES.AUTHORIZATION_ERROR);
  }
}
