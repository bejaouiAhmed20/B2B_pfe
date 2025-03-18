import { Response } from 'express';

export enum ErrorType {
  NOT_FOUND = 'NOT_FOUND',
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INTERNAL_SERVER = 'INTERNAL_SERVER',
  VALIDATION = 'VALIDATION'
}

interface ErrorResponse {
  message: string;
  code?: string;
  details?: any;
}

export class AppError extends Error {
  type: ErrorType;
  details?: any;

  constructor(message: string, type: ErrorType, details?: any) {
    super(message);
    this.type = type;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const handleError = (error: any, res: Response): Response => {
  if (error instanceof AppError) {
    const errorResponse: ErrorResponse = {
      message: error.message
    };
    
    if (error.details) {
      errorResponse.details = error.details;
    }
    
    // Log the error to console instead of using logger
    console.error(`${error.type}: ${error.message}`, error.details);
    
    // Return appropriate status code based on error type
    switch (error.type) {
      case ErrorType.NOT_FOUND:
        return res.status(404).json(errorResponse);
      case ErrorType.BAD_REQUEST:
        return res.status(400).json(errorResponse);
      case ErrorType.UNAUTHORIZED:
        return res.status(401).json(errorResponse);
      case ErrorType.FORBIDDEN:
        return res.status(403).json(errorResponse);
      case ErrorType.VALIDATION:
        return res.status(422).json(errorResponse);
      default:
        return res.status(500).json(errorResponse);
    }
  }
  
  // For unexpected errors
  console.error('Unexpected error', error);
  return res.status(500).json({ message: 'An unexpected error occurred' });
};