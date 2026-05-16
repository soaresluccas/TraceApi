import type { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

const buckets = new Map<string, RateLimitEntry>();

export function createRateLimitMiddleware(options: RateLimitOptions) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();
    const key = getClientKey(req);
    const entry = buckets.get(key);

    cleanupExpiredBuckets(now);

    if (!entry || entry.resetAt <= now) {
      buckets.set(key, {
        count: 1,
        resetAt: now + options.windowMs,
      });
      next();
      return;
    }

    if (entry.count >= options.maxRequests) {
      res.status(429).json({
        success: false,
        message: 'Muitas tentativas. Tente novamente em alguns minutos.',
      });
      return;
    }

    entry.count += 1;
    next();
  };
}

function getClientKey(req: Request): string {
  const forwardedFor = req.headers['x-forwarded-for'];

  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0].trim();
  }

  return req.ip || req.socket.remoteAddress || 'unknown';
}

function cleanupExpiredBuckets(now: number): void {
  for (const [key, entry] of buckets.entries()) {
    if (entry.resetAt <= now) {
      buckets.delete(key);
    }
  }
}
