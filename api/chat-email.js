import { createMailer, getMailAddresses } from './_lib/mailer.js';
import { filterProfanity } from './_lib/profanity.js';
import { isRateLimited } from './_lib/rateLimit.js';
import { getClientIp } from './_lib/clientIp.js';
import { isValidEmail, isNonEmptyString, isOptionalString } from './_lib/validate.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (isRateLimited(`chat-email:${getClientIp(req)}`, { windowMs: 60_000, max: 5 })) {
    return res.status(429).json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.' });
  }

  try {
    const { email, category, problem, suggestion } = req.body || {};

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: '올바른 이메일 주소를 입력해 주세요.' });
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

    const filteredProblem = filterProfanity(problem);
    const filteredSuggestion = filterProfanity(suggestion);

    const transporter = createMailer();
    const { from, to } = getMailAddresses('노사협의회 챗봇');

    const mailOptions = {
      from,
      to,
      subject: '[노사협의회 챗봇] 새로운 문의가 접수되었습니다',
      text: `챗봇을 통해 새로운 문의가 접수되었습니다.\n\n답변 받을 이메일: ${email}\n\n분류: ${category}\n\n현상 및 문제점:\n${filteredProblem || '없음'}\n\n개선 제안 아이디어:\n${filteredSuggestion}`
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Email send error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
