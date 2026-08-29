import { createMailer, getMailAddresses } from './_lib/mailer.js';
import { filterProfanity } from './_lib/profanity.js';
import { isRateLimited } from './_lib/rateLimit.js';
import { getClientIp } from './_lib/clientIp.js';
import { isNonEmptyString, isOptionalString } from './_lib/validate.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (isRateLimited(`submit:${getClientIp(req)}`, { windowMs: 60_000, max: 5 })) {
    return res.status(429).json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.' });
  }

  try {
    const { type, authorMode, author, category, problem, suggestion } = req.body || {};

    if (type !== 'proposal' && type !== 'counsel') {
      return res.status(400).json({ error: '잘못된 요청입니다.' });
    }
    if (!isNonEmptyString(category, 50)) {
      return res.status(400).json({ error: '분류를 선택해 주세요.' });
    }
    if (!isNonEmptyString(suggestion, 4000)) {
      return res.status(400).json({ error: '개선 제안 내용을 입력해 주세요.' });
    }
    if (!isOptionalString(problem, 4000)) {
      return res.status(400).json({ error: '입력 내용이 너무 깁니다.' });
    }
    if (authorMode === 'named' && !isNonEmptyString(author, 100)) {
      return res.status(400).json({ error: '성명 및 소속을 입력해 주세요.' });
    }

    const typeName = type === 'proposal' ? '안건 제안' : '익명 고충 상담';

    const filteredProblem = filterProfanity(problem);
    const filteredSuggestion = filterProfanity(suggestion);

    const transporter = createMailer();
    const { from, to } = getMailAddresses('노사협의회 플랫폼');

    const mailOptions = {
      from,
      to,
      subject: `[노사협의회 플랫폼] 새로운 ${typeName}이 접수되었습니다`,
      text: `새로운 ${typeName}이 접수되었습니다.\n\n분류: ${category}\n\n현상 및 문제점:\n${filteredProblem || '없음'}\n\n개선 제안 아이디어:\n${filteredSuggestion}`
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Email send error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
