import { Request, Response, NextFunction } from 'express';
import { getAppConfig } from '../config/env';

const unsafeMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function originFromReferer(value?: string) {
  if (!value) return null;
  try { return new URL(value).origin; } catch { return null; }
}

export function validateCookieRequestOrigin(req: Request, res: Response, next: NextFunction) {
  if (!unsafeMethods.has(req.method) || req.path === '/webhook') return next();
  if (req.headers.authorization?.startsWith('Bearer ')) return next();

  const hasCookie = Boolean(req.headers.cookie?.split(';').some((part) => part.trim().startsWith('everimet_auth=')));
  if (!hasCookie) return next();

  const config = getAppConfig();
  const allowed = new Set<string>();
  try { allowed.add(new URL(config.publicAppUrl).origin); } catch { /* invalid config is handled elsewhere */ }
  for (const value of (process.env.CORS_ORIGIN || '').split(',')) {
    try { if (value.trim()) allowed.add(new URL(value.trim()).origin); } catch { /* ignore malformed optional origin */ }
  }
  if (!config.isProduction) {
    ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173']
      .forEach((origin) => allowed.add(origin));
  }
  const requestOrigin = req.header('origin') || originFromReferer(req.header('referer'));
  if (!requestOrigin || !allowed.has(requestOrigin)) {
    return res.status(403).json({ success: false, message: 'Cross-site state-changing requests are not allowed.' });
  }
  next();
}
