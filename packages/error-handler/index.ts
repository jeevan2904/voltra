export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    details?: any
  ) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    Error.captureStackTrace(this);
  }
}

// Not Found Error
export class NotFoundError extends AppError {
  constructor(message = 'Resources not found!') {
    super(message, 404);
  }
}

// Validation Error (Use for Joi/ zod/ react-hook-form etc.,)
export class ValidationError extends AppError {
  constructor(message = 'Invalid Request Data', details?: any) {
    super(message, 400, true, details);
  }
}

// JWT Authentication Error
export class AuthError extends AppError {
  constructor(message = 'Unauthorized User!') {
    super(message, 401);
  }
}

// Forbidden Access Error (Insufficient Permissions Error)
// Ex: Like accessing admin-routes etc.,
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden Access!') {
    super(message, 403);
  }
}

// Database Error (For MongoDB/ Postgres Errors)
export class DatabaseError extends AppError {
  constructor(message = 'Database Error!', details?: any) {
    super(message, 500, true, details);
  }
}

// Rate Limit Error (If User exceeds API Limits)
export class RateLimitError extends AppError {
  constructor(message = 'Too many requests, Please try again later!') {
    super(message, 429);
  }
}
