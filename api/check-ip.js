import { getClientIp, isAllowedIp } from './_lib/clientIp.js';

// TEMP DEBUG: surfaces the raw proxy headers so we can see what
// Cloudflare -> Vercel actually delivers for this domain. Remove the
// `debug` block once the cf-connecting-ip / x-forwarded-for mismatch is
// diagnosed - these header values are not secret, but there's no reason
// to expose them permanently.
export default function handler(req, res) {
  const clientIp = getClientIp(req);

  const debug = {
    cfConnectingIp: req.headers['cf-connecting-ip'] || null,
    xForwardedFor: req.headers['x-forwarded-for'] || null,
    xRealIp: req.headers['x-real-ip'] || null,
    xVercelForwardedFor: req.headers['x-vercel-forwarded-for'] || null,
    socketRemoteAddress: req.socket?.remoteAddress || null
  };

  if (isAllowedIp(clientIp)) {
    return res.status(200).json({ allowed: true, ip: clientIp, debug });
  } else {
    return res.status(403).json({ allowed: false, ip: clientIp, debug });
  }
}
