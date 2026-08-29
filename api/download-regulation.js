import fs from 'fs';
import path from 'path';
import { getClientIp, isAllowedIp } from './_lib/clientIp.js';
import { isRateLimited } from './_lib/rateLimit.js';

const REGULATION_DIR = path.join(process.cwd(), 'regulations');

// Explicit whitelist: the query param picks a key here rather than a raw
// filename, so there is no path-traversal surface even before the
// startsWith() check below.
const ALLOWED_FILES = new Set([
  '행복ICT 제규정.pdf',
  '행복ICT 취업규칙.pdf',
  '행복ICT 내부규정.pdf',
  '행복ICT 개인정보 내부관리 계획서.pdf',
  '사내동호회운영규정.pdf'
]);

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const clientIp = getClientIp(req);

  if (isRateLimited(`download-regulation:${clientIp}`, { windowMs: 60_000, max: 20 })) {
    return res.status(429).json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.' });
  }

  if (!isAllowedIp(clientIp)) {
    return res.status(403).json({ error: '인가된 사내 네트워크에서만 다운로드할 수 있습니다.', ip: clientIp });
  }

  const fileName = req.query?.file;
  if (typeof fileName !== 'string' || !ALLOWED_FILES.has(fileName)) {
    return res.status(400).json({ error: '잘못된 파일 요청입니다.' });
  }

  const filePath = path.join(REGULATION_DIR, fileName);
  if (!filePath.startsWith(REGULATION_DIR)) {
    return res.status(400).json({ error: '잘못된 파일 요청입니다.' });
  }

  try {
    const data = fs.readFileSync(filePath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    return res.status(200).send(data);
  } catch (err) {
    console.error('Regulation download error:', err);
    return res.status(404).json({ error: '파일을 찾을 수 없습니다.' });
  }
}
