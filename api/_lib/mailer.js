import nodemailer from 'nodemailer';

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function createMailer() {
  const user = requireEnv('SMTP_USER');
  const pass = requireEnv('SMTP_PASS');

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.office365.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: { user, pass },
    tls: { ciphers: 'SSLv3' }
  });
}

export function getMailAddresses(fallbackFromName) {
  const user = requireEnv('SMTP_USER');
  const to = requireEnv('SMTP_TO');

  return {
    from: process.env.SMTP_FROM || `"${fallbackFromName}" <${user}>`,
    to
  };
}
