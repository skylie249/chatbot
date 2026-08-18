// NOTE: on.nexalab.app is Cloudflare-proxied DNS in front of a Vercel
// deployment. Vercel's own edge overwrites x-forwarded-for / x-real-ip /
// x-vercel-forwarded-for with the Cloudflare hop's IP rather than the
// original client, so those headers only ever show Cloudflare's edge IP
// here. cf-connecting-ip is set by Cloudflare itself and survives that
// hop untouched, so it's the only header carrying the real client IP in
// this setup - confirmed via api/check-ip.js debug output.
//
// cf-connecting-ip is only trustworthy for requests that actually came
// through Cloudflare. Vercel deployments are typically also reachable
// directly on their own *.vercel.app URL, bypassing Cloudflare entirely -
// a request sent straight there could set its own fake cf-connecting-ip
// and there'd be nothing to stop it. As a mitigation, only trust the
// header when the Host the request came in on matches the expected
// public domain; anything else falls back to the raw connection info,
// which won't match ALLOWED_IPS. This is defense in depth, not a
// complete fix - if Vercel passes through a client-forged Host header
// unchanged for direct *.vercel.app requests, both headers could be
// forged together. The more robust fix is disabling/protecting the
// default *.vercel.app alias in the Vercel project settings so
// Cloudflare is the only way in.
const TRUSTED_HOST = process.env.TRUSTED_HOST || 'on.nexalab.app';

export function getClientIp(req) {
  const host = req.headers['host'];
  const cfIp = req.headers['cf-connecting-ip'];
  if (cfIp && host === TRUSTED_HOST) {
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
