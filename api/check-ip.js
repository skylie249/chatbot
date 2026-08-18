import { getClientIp, isAllowedIp } from './_lib/clientIp.js';

export default function handler(req, res) {
  const clientIp = getClientIp(req);

  if (isAllowedIp(clientIp)) {
    return res.status(200).json({ allowed: true, ip: clientIp });
  } else {
    return res.status(403).json({ allowed: false, ip: clientIp });
  }
}
