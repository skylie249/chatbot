import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import nodemailer from 'nodemailer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'file-writer-plugin',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/api/submit' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });
            req.on('end', () => {
              try {
                const data = JSON.parse(body);
                const { type, content, title } = data;

                // Formatted date (YYYY-MM-DD HH:mm:ss)
                const now = new Date();
                const kstOffset = 9 * 60 * 60 * 1000;
                const kstDate = new Date(now.getTime() + kstOffset);
                const dateString = kstDate.toISOString().replace('T', ' ').substring(0, 19);

                let logEntry = `[${dateString}]\n`;
                if (title) logEntry += `제목: ${title}\n`;
                logEntry += `내용: ${content}\n----------------------------------------\n\n`;

                if (type === 'proposal') {
                  fs.appendFileSync(path.resolve('./proposals.txt'), logEntry);
                } else if (type === 'counsel') {
                  fs.appendFileSync(path.resolve('./counsel.txt'), logEntry);
                }

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true }));
              } catch (err) {
                res.statusCode = 500;
                res.end(JSON.stringify({ success: false, error: err.message }));
              }
            });
            return;
          } else if (req.url === '/api/chat-email' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });
            req.on('end', async () => {
              try {
                const { email, content } = JSON.parse(body);

                // Formatted date (YYYY-MM-DD HH:mm:ss)
                const now = new Date();
                const kstOffset = 9 * 60 * 60 * 1000;
                const kstDate = new Date(now.getTime() + kstOffset);
                const dateString = kstDate.toISOString().replace('T', ' ').substring(0, 19);

                const logEntry = `[${dateString}] 이메일: ${email}\n내용: ${content}\n----------------------------------------\n\n`;
                fs.appendFileSync(path.resolve('./chat_inquiries.txt'), logEntry);

                const transporter = nodemailer.createTransport({
                  host: 'smtp.office365.com',
                  port: 587,
                  secure: false,
                  auth: {
                    user: 'weeklyadmin@happyict.co.kr',
                    pass: 'Happy1234'
                  },
                  tls: {
                    ciphers: 'SSLv3'
                  }
                });

                const mailOptions = {
                  from: '"노사협의회 챗봇" <weeklyadmin@happyict.co.kr>',
                  //to: 'hogyun.kim@happyict.co.kr, kisung77@happyict.co.kr,su5994@happyict.co.kr',
                  to: 'hogyun.kim@happyict.co.kr',
                  subject: '[노사협의회 챗봇] 새로운 문의가 접수되었습니다',
                  text: `챗봇을 통해 새로운 문의가 접수되었습니다.\n\n답변 받을 이메일: ${email}\n\n문의 내용:\n${content}`
                };

                await transporter.sendMail(mailOptions);

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true }));
              } catch (err) {
                console.error('Email send error:', err);
                res.statusCode = 500;
                res.end(JSON.stringify({ success: false, error: err.message }));
              }
            });
            return;
          }
          next();
        });
      }
    }
  ],
})
