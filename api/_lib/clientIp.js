// NOTE: on.nexalab.app is Cloudflare-proxied DNS in front of a Vercel
// deployment. Vercel's own edge overwrites x-forwarded-for / x-real-ip /
// x-vercel-forwarded-for with the Cloudflare hop's IP rather than the
// original client, so those headers only ever show Cloudflare's edge IP
// here. cf-connecting-ip is set by Cloudflare itself and carries the real
// client IP - confirmed via api/check-ip.js debug output - but only for
// requests that actually went through Cloudflare. Vercel projects are
// also reachable directly on their own *.vercel.app URL, bypassing
// Cloudflare entirely, and a request sent straight there could set its
// own fake cf-connecting-ip.
//
// Vercel's free plan has no Deployment Protection to lock that URL down,
// so instead a Cloudflare Worker (see cloudflare-worker.js, routed to
// on.nexalab.app/*) injects a secret header on every request it forwards
// to the origin. Only requests carrying that exact secret are treated as
// having come through Cloudflare; anything else (including direct
// *.vercel.app hits, which never pass through the Worker) falls back to
// the raw connection info, which won't match ALLOWED_IPS. Unlike a
// Host-header check, this can't be spoofed by a client crafting its own
// request - only the Worker knows the secret.
const SHARED_SECRET_HEADER = 'x-cf-shared-secret';

function passedThroughCloudflare(req) {
  const secret = process.env.CF_SHARED_SECRET;
  return Boolean(secret) && req.headers[SHARED_SECRET_HEADER] === secret;
}

export function getClientIp(req) {
  const cfIp = req.headers['cf-connecting-ip'];
  if (cfIp && passedThroughCloudflare(req)) {
    return Array.isArray(cfIp) ? cfIp[0].trim() : cfIp.trim();
  }

  let ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';

  if (ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }

  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }

  return ip;
}

export function isAllowedIp(ip) {
  const allowedIps = (process.env.ALLOWED_IPS || '').split(',').map(entry => entry.trim());
  return allowedIps.includes(ip) || allowedIps.includes('*');
}
