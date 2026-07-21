import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { email, content } = req.body;

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
      from: process.env.SMTP_FROM || '"노사협의회 챗봇" <weeklyadmin@happyict.co.kr>',
      to: process.env.SMTP_TO || 'hogyun.kim@happyict.co.kr',
      subject: '[노사협의회 챗봇] 새로운 문의가 접수되었습니다',
      text: `챗봇을 통해 새로운 문의가 접수되었습니다.\n\n답변 받을 이메일: ${email}\n\n문의 내용:\n${content}`
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Email send error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
