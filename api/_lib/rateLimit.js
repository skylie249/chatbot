// Best-effort in-memory rate limiter. Serverless functions can run as
// multiple concurrent instances and cold-start with a fresh Map, so this
// does not guarantee a hard global limit - it only protects a single warm
// instance from rapid repeat requests. For strict limits under real load,
// back this with a shared store (e.g. Upstash Redis) instead.
const buckets = new Map();

export function isRateLimited(key, { windowMs = 60_000, max = 5 } = {}) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now - bucket.start > windowMs) {
    buckets.set(key, { start: now, count: 1 });
    return false;
  }

  bucket.count += 1;
  return bucket.count > max;
}
