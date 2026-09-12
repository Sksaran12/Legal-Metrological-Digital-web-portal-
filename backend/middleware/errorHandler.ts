import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const statusCode = err.statusCode || err.status || 500;
  console.error(`💥 [API Error] ${req.method} ${req.originalUrl}:`, err?.stack || err?.message || err);

  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500
      ? 'An unexpected internal server error occurred.'
      : (err.message || 'Request failed.')
  });
}
