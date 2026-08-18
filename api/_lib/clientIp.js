// NOTE: this app runs behind Cloudflare (on.nexalab.app), not Vercel's
// edge. Cloudflare sets cf-connecting-ip to the true client IP regardless
// of any other proxies in the chain, which is more reliable here than
// x-forwarded-for - prefer it when present. Whatever proxy sits directly
// in front of the app process must be the one setting these headers
// itself; if a client could reach the app without going through that
// proxy, they could forge either header, so these values are only as
// trustworthy as that network boundary.
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
