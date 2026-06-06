export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function notFound(resource: string): AppError {
  return new AppError(404, 'NOT_FOUND', `${resource} not found`);
}

export function badRequest(message: string, details?: Record<string, unknown>): AppError {
  return new AppError(400, 'BAD_REQUEST', message, details);
}

export function validationError(message: string, details?: Record<string, unknown>): AppError {
  return new AppError(422, 'VALIDATION_ERROR', message, details);
}
