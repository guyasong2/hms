import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import { AppError } from './errorHandler';

export const requireRole = (...roles: string[]) =>
  (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('Forbidden: insufficient permissions', 403));
    }
    next();
  };
