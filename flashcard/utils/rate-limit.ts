import { NextApiRequest, NextApiResponse } from 'next';

interface RateLimitState {
  count: number;
  resetTime: number;
  lastRequest: number;
}

const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 60; // 60 requests per minute
const MIN_SPACING = 1000; // Minimum 1 second between requests
const CLEANUP_INTERVAL = 5 * 60 * 1000; // Clean up every 5 minutes

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitState>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, state] of rateLimitStore.entries()) {
    if (now >= state.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

export function rateLimit(req: NextApiRequest, res: NextApiResponse): boolean {
  const clientId = req.headers['x-forwarded-for'] as string || 
                  req.socket.remoteAddress || 
                  'unknown';

  const now = Date.now();
  let state = rateLimitStore.get(clientId);

  // Initialize or reset if window expired
  if (!state || now >= state.resetTime) {
    state = {
      count: 0,
      resetTime: now + WINDOW_MS,
      lastRequest: now
    };
  }

  // Check request spacing
  const timeSinceLastRequest = now - state.lastRequest;
  if (timeSinceLastRequest < MIN_SPACING) {
    const retryAfter = Math.ceil((MIN_SPACING - timeSinceLastRequest) / 1000);
    res.setHeader('Retry-After', retryAfter);
    res.setHeader('X-RateLimit-Reset', Math.ceil(state.resetTime / 1000));
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Please wait before making more requests',
      retryAfter
    });
    return false;
  }

  // Check rate limit
  if (state.count >= MAX_REQUESTS) {
    const retryAfter = Math.ceil((state.resetTime - now) / 1000);
    res.setHeader('Retry-After', retryAfter);
    res.setHeader('X-RateLimit-Reset', Math.ceil(state.resetTime / 1000));
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later',
      retryAfter
    });
    return false;
  }

  // Update state
  state.count++;
  state.lastRequest = now;
  rateLimitStore.set(clientId, state);

  // Set headers
  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
  res.setHeader('X-RateLimit-Remaining', MAX_REQUESTS - state.count);
  res.setHeader('X-RateLimit-Reset', Math.ceil(state.resetTime / 1000));
  res.setHeader('X-RateLimit-MinSpacing', MIN_SPACING);

  return true;
}

// Higher-order function to add rate limiting to an API route
export function withRateLimit(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (!rateLimit(req, res)) {
      return;
    }
    return handler(req, res);
  };
}
