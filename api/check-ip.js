export default function handler(req, res) {
  let clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
  
  if (clientIp.includes(',')) {
    clientIp = clientIp.split(',')[0].trim();
  }

  // IPv4-mapped IPv6 주소 처리 (예: ::ffff:127.0.0.1)
  if (clientIp.startsWith('::ffff:')) {
    clientIp = clientIp.substring(7);
  }

  const allowedIps = (process.env.ALLOWED_IPS || '').split(',').map(ip => ip.trim());

  if (allowedIps.includes(clientIp) || allowedIps.includes('*')) {
    return res.status(200).json({ allowed: true, ip: clientIp });
  } else {
    return res.status(403).json({ allowed: false, ip: clientIp });
  }
}
