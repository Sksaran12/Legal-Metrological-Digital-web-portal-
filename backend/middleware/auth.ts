import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../models/User';
import { getAppConfig } from '../config/env';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    name: string;
    identifier?: string;
    enterpriseName?: string;
    zone?: string;
  };
}

export function authenticateJWT(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const cookieToken = req.headers.cookie
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('everimet_auth='))
    ?.slice('everimet_auth='.length);
  const tokenValue = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : cookieToken;

  if (!tokenValue) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }
  const token = decodeURIComponent(tokenValue);

  let secret: string;
  try {
    secret = getAppConfig().jwtSecret;
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Authentication service is not configured.'
    });
  }

  try {
    const decoded = jwt.verify(token, secret) as {
      id: string;
      email: string;
      role: UserRole;
      name: string;
      identifier?: string;
      enterpriseName?: string;
      zone?: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.'
    });
  }
}

export function authorizeRoles(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Role '${req.user?.role}' is not authorized to access this resource.`
      });
    }
    next();
  };
}
