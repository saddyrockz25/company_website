const express = require('express');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// Email transport - configure via env vars
// Required: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
// Optional: SMTP_SECURE ("true"/"false"), TO_EMAIL
function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = String(process.env.SMTP_SECURE || 'false') === 'true';

  if (!host || !user || !pass) {
    throw new Error('SMTP configuration missing. Set SMTP_HOST, SMTP_USER, SMTP_PASS.');
  }

  return nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
}

app.post('/api/send-email', async (req, res) => {
  try {
    const { name, email, message } = req.body || {};
    const to = "reachus.aimhigh@gmail.com";

    const transporter = createTransport();
    const subject = `Website Contact: ${name || 'New Inquiry'}`;
    const text = [
      `Name: ${name || ''}`,
      `Email: ${email || ''}`,

      '',
      'Message:',
      message || ''
    ].join('\n');

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('send-email error:', err.message);
    res.status(500).json({ ok: false, error: 'Failed to send email' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);
});


