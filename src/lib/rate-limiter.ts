/**
 * In-memory sliding window rate limiter (SEC-12)
 * Membatasi percobaan gagal untuk mencegah serangan brute force.
 * Catatan keterbatasan serverless: Pada arsitektur multi-instance serverless Vercel,
 * state in-memory bersifat per instance (cukup efektif untuk mitigasi brute force pada demo prototipe).
 */

interface RateLimitRecord {
  attempts: number;
  resetAt: number;
}

const loginAttempts = new Map<string, RateLimitRecord>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 menit

export function checkLoginRateLimit(key: string): {
  isBlocked: boolean;
  remainingAttempts: number;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  const record = loginAttempts.get(key);

  if (!record || now > record.resetAt) {
    return {
      isBlocked: false,
      remainingAttempts: MAX_ATTEMPTS,
      retryAfterSeconds: 0,
    };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
    return {
      isBlocked: true,
      remainingAttempts: 0,
      retryAfterSeconds,
    };
  }

  return {
    isBlocked: false,
    remainingAttempts: MAX_ATTEMPTS - record.attempts,
    retryAfterSeconds: 0,
  };
}

export function recordFailedLogin(key: string): void {
  const now = Date.now();
  const record = loginAttempts.get(key);

  if (!record || now > record.resetAt) {
    loginAttempts.set(key, {
      attempts: 1,
      resetAt: now + WINDOW_MS,
    });
  } else {
    record.attempts += 1;
  }
}

export function resetLoginRateLimit(key: string): void {
  loginAttempts.delete(key);
}
