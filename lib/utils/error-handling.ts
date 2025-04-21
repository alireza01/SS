import { PostgrestError } from '@supabase/supabase-js'

export class AppError extends Error {
  public statusCode: number
  public code: string

  constructor(message: string, statusCode = 500, code = 'INTERNAL_SERVER_ERROR') {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.name = 'AppError'
  }
}

export class DatabaseError extends AppError {
  constructor(error: PostgrestError) {
    super(error.message, 500, 'DATABASE_ERROR')
    this.name = 'DatabaseError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Not authenticated') {
    super(message, 401, 'UNAUTHENTICATED')
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Not authorized') {
    super(message, 403, 'UNAUTHORIZED')
    this.name = 'AuthorizationError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof PostgrestError) {
    return new DatabaseError(error)
  }

  if (error instanceof Error) {
    return new AppError(error.message)
  }

  return new AppError('An unexpected error occurred')
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

export function isDatabaseError(error: unknown): error is DatabaseError {
  return error instanceof DatabaseError
}

export function isAuthenticationError(error: unknown): error is AuthenticationError {
  return error instanceof AuthenticationError
}

export function isAuthorizationError(error: unknown): error is AuthorizationError {
  return error instanceof AuthorizationError
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError
} 