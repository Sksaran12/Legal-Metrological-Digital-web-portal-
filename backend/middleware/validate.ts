import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export function handleValidationErrors(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((err: any) => ({
      field: err.param || err.path,
      message: err.msg
    }));
    return res.status(400).json({
      success: false,
      message: 'Input validation failed. Please check your request parameters.',
      errors: formatted
    });
  }
  next();
}
