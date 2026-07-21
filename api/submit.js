import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { type, content, title } = req.body;
    const typeName = type === 'proposal' ? '안건 제안' : '익명 고충 상담';

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
      to: process.env.SMTP_TO || 'hogyun.kim@happyict.co.kr',
      subject: `[노사협의회 플랫폼] 새로운 ${typeName}이 접수되었습니다`,
      text: `새로운 ${typeName}이 접수되었습니다.\n\n${title ? `제목: ${title}\n` : ''}내용:\n${content}`
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Email send error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
