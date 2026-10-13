import { Redis } from '@upstash/redis';

// Supports both the legacy Vercel KV env vars (KV_REST_API_URL/TOKEN) and
// the newer Marketplace Redis integration (UPSTASH_REDIS_REST_URL/TOKEN) -
// Vercel injects whichever pair applies depending on how the store was
// connected, and both point at an Upstash Redis REST endpoint.
const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  throw new Error('Missing Redis env vars: set KV_REST_API_URL/KV_REST_API_TOKEN or UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN');
}

export const kv = new Redis({ url, token });
