// NOTE: x-forwarded-for is only trustworthy when the app runs behind a
// proxy that sets/overwrites this header itself (e.g. Vercel's edge
// network). If this is ever self-hosted behind a different reverse proxy,
// make sure that proxy strips any client-supplied x-forwarded-for before
// appending the real client IP - otherwise this value is spoofable.
export function getClientIp(req) {
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
