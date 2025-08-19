import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

interface CustomError extends Error {
  status?: number;
  code?: string;
}

export const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the error
  logger.error('Request error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Default error values
  let status = error.status || 500;
  let message = error.message || 'Internal server error';
  let code = error.code || 'INTERNAL_ERROR';

  // Handle specific error types
  if (error.name === 'ValidationError') {
    status = 400;
    code = 'VALIDATION_ERROR';
  } else if (error.name === 'CastError') {
    status = 400;
    code = 'INVALID_ID';
    message = 'Invalid ID format';
  } else if (error.name === 'MongoError' && error.code === 11000) {
    status = 409;
    code = 'DUPLICATE_ENTRY';
    message = 'Duplicate entry';
  } else if (error.name === 'JsonWebTokenError') {
    status = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid authentication token';
  } else if (error.name === 'TokenExpiredError') {
    status = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Authentication token expired';
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && status === 500) {
    message = 'Internal server error';
  }

  // Send error response
  res.status(status).json({
    error: {
      code,
      message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
        details: error
      })
    },
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response): void => {
  logger.warn('Route not found:', {
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Resource not found',
      path: req.path,
      method: req.method
    },
    timestamp: new Date().toISOString()
  });
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};