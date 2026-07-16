import { ERROR_CODES, HTTP_STATUS } from '../constants';

import { AppError } from './app-error';

export class AuthenticationError extends AppError {
  public constructor(message = 'Authentication required') {
    super(message, HTTP_STATUS.UNAUTHORIZED, [], ERROR_CODES.AUTHENTICATION_ERROR);
  }
}
