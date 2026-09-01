const nodemailer = require('nodemailer');

let transporter;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }
  return transporter;
};

exports.sendLoginCode = async (email, code) => {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!from || !process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    const error = new Error('SMTP is not configured');
    error.status = 500;
    throw error;
  }

  await getTransporter().sendMail({
    from,
    to: email,
    subject: 'Votre code de vérification',
    text: `Votre code de vérification est ${code}. Il expire dans 10 minutes.`,
    html: `<p>Votre code de vérification est <strong>${code}</strong>.</p><p>Il expire dans 10 minutes.</p>`
  });
};
