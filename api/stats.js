import { kv } from './_lib/kv.js';
import { getClientIp, isAllowedIp } from './_lib/clientIp.js';
import { recentDateKeys, statKey } from './_lib/dailyStats.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const clientIp = getClientIp(req);
  if (!isAllowedIp(clientIp)) {
    return res.status(403).json({ error: '인가된 사내 네트워크에서만 조회할 수 있습니다.', ip: clientIp });
  }

  const days = Math.min(Math.max(parseInt(req.query?.days, 10) || 30, 1), 90);
  const dates = recentDateKeys(days);

  try {
    const [visitCounts, inquiryCounts] = await Promise.all([
      kv.mget(...dates.map((d) => statKey('visit', d))),
      kv.mget(...dates.map((d) => statKey('inquiry', d)))
    ]);

    const rows = dates.map((date, i) => ({
      date,
      visits: Number(visitCounts[i]) || 0,
      inquiries: Number(inquiryCounts[i]) || 0
    }));

    if (req.query?.format === 'html') {
      const tableRows = rows
        .map((r) => `<tr><td>${r.date}</td><td>${r.visits}</td><td>${r.inquiries}</td></tr>`)
        .join('');
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>일일 접속/문의 통계</title>
<style>
  body { font-family: sans-serif; padding: 24px; }
  table { border-collapse: collapse; width: 100%; max-width: 480px; }
  th, td { border: 1px solid #ccc; padding: 8px 12px; text-align: center; }
  th { background: #f3f4f6; }
</style></head><body>
<h2>일일 접속/문의 통계 (최근 ${days}일)</h2>
<table><thead><tr><th>날짜</th><th>접속 수</th><th>문의 접근 수</th></tr></thead><tbody>${tableRows}</tbody></table>
</body></html>`;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    return res.status(200).json({ days, rows });
  } catch (err) {
    console.error('Stats error:', err);
    return res.status(500).json({ error: '통계 조회 중 오류가 발생했습니다.' });
  }
}
