import { InternalServerErrorException } from '@nestjs/common';

export class DatabaseOperationException extends InternalServerErrorException {
  constructor(message = 'Failed to persist tracking event.') {
    super({
      message,
      errors: [],
    });
  }
}
