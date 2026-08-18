// NOTE: on.nexalab.app is Cloudflare-proxied DNS in front of a Vercel
// deployment. Vercel's own edge overwrites x-forwarded-for / x-real-ip /
// x-vercel-forwarded-for with the Cloudflare hop's IP rather than the
// original client, so those headers only ever show Cloudflare's edge IP
// here. cf-connecting-ip is set by Cloudflare itself and survives that
// hop untouched, so it's the only header carrying the real client IP in
// this setup - confirmed via api/check-ip.js debug output. This is only
// trustworthy as long as Cloudflare is the sole path to the app (i.e.
// Vercel's deployment isn't reachable directly on its *.vercel.app URL
// or another hostname that bypasses Cloudflare, which a client could use
// to forge this header).
export function getClientIp(req) {
  const cfIp = req.headers['cf-connecting-ip'];
  if (cfIp) {
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
