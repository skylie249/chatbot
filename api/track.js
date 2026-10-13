import { kv } from './_lib/kv.js';
import { getClientIp } from './_lib/clientIp.js';
import { isRateLimited } from './_lib/rateLimit.js';
import { dateKeySeoul, statKey } from './_lib/dailyStats.js';

const VALID_TYPES = new Set(['visit', 'inquiry']);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const clientIp = getClientIp(req);
  if (isRateLimited(`track:${clientIp}`, { windowMs: 60_000, max: 30 })) {
    return res.status(429).json({ error: '요청이 너무 많습니다.' });
  }

  const { type } = req.body || {};
  if (!VALID_TYPES.has(type)) {
    return res.status(400).json({ error: '잘못된 요청입니다.' });
  }

  try {
    await kv.incr(statKey(type, dateKeySeoul()));
    return res.status(204).end();
  } catch (err) {
    console.error('Track error:', err);
    return res.status(500).json({ error: '기록 중 오류가 발생했습니다.' });
  }
}
