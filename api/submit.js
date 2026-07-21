import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { type, category, problem, suggestion } = req.body;
    const typeName = type === 'proposal' ? '안건 제안' : '익명 고충 상담';

    const filterProfanity = (text) => {
      if (!text) return text;
      const badWords = ['개새끼', '씨발', '병신', '지랄', '좆', '미친', '염병', '새끼', '존나', '씹', '닥쳐', '꺼져', '호로자식', '등신', '호구', '느금마', '느애비', '엠창', '창녀', '걸레',
        '시발', '씨빨', '씨바', '시바', '씨벌', '개새', '새키', '졸라', '찌랄', 'ㅅㅂ', 'ㅂㅅ', 'ㅈㄹ', 'ㅈㄴ'];
      let filtered = text;
      badWords.forEach(word => {
        const regex = new RegExp(word, 'gi');
        filtered = filtered.replace(regex, '*'.repeat(word.length));
      });
      return filtered;
    };

    const filteredProblem = filterProfanity(problem);
    const filteredSuggestion = filterProfanity(suggestion);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.office365.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'weeklyadmin@happyict.co.kr',
        pass: process.env.SMTP_PASS || 'Happy1234'
      },
      tls: {
        ciphers: 'SSLv3'
      }
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || '"노사협의회 플랫폼" <weeklyadmin@happyict.co.kr>',
      to: process.env.SMTP_TO || 'mem.employee@happyict.co.kr',
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
