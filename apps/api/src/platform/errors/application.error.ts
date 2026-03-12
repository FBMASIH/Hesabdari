export class ApplicationError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(code: string, message: string, statusCode = 400) {
    super(message);
    this.name = 'ApplicationError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class NotFoundError extends ApplicationError {
  constructor(entity: string, id: string) {
    super('NOT_FOUND', `${entity} with id ${id} not found`, 404);
  }
}

export class ConflictError extends ApplicationError {
  constructor(message: string) {
    super('CONFLICT', message, 409);
  }
}

export class ForbiddenError extends ApplicationError {
  constructor(message = 'Insufficient permissions') {
    super('FORBIDDEN', message, 403);
  }
}
