import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

// Create a map to store requests
const limiter = new Map();

// Rate limit window in milliseconds (1 hour)
const WINDOW_MS = 60 * 60 * 1000;

// Max number of requests per window
const MAX_REQUESTS = 100;

export async function rateLimitMiddleware(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const key = `${session?.user?.id || ip}`;
  
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  
  // Clean old requests
  for (const [reqKey, timestamps] of limiter) {
    limiter.set(reqKey, timestamps.filter((timestamp: number) => timestamp > windowStart));
    if (limiter.get(reqKey).length === 0) {
      limiter.delete(reqKey);
    }
  }
  
  // Get user's requests
  const requests = limiter.get(key) || [];
  const recentRequests = requests.filter((timestamp: number) => timestamp > windowStart);
  
  if (recentRequests.length >= MAX_REQUESTS) {
    res.setHeader('Retry-After', Math.ceil(WINDOW_MS / 1000));
    res.status(429).json({
      error: 'Too many requests',
      message: 'Please try again in about an hour',
    });
    throw new Error('Rate limit exceeded');
  }
  
  // Add current request
  recentRequests.push(now);
  limiter.set(key, recentRequests);
}
