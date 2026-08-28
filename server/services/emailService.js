import nodemailer from 'nodemailer';

// Configure transporter dynamically from environment variables
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (user && pass) {
    if (process.env.GMAIL_USER && !host) {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass }
      });
    }

    return nodemailer.createTransport({
      host: host || 'smtp.gmail.com',
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  }

  return null;
}

export async function sendOtpEmail(toEmail, otpCode, userName = 'Student') {
  const transporter = createTransporter();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0d0f12; color: #f3f4f6; margin: 0; padding: 24px; }
        .card { max-width: 480px; margin: 0 auto; background-color: #14171c; border: 1px solid #282a2f; border-radius: 12px; padding: 32px 24px; text-align: center; }
        .logo { font-size: 20px; font-weight: 800; color: #4f46e5; margin-bottom: 8px; letter-spacing: -0.02em; }
        .title { font-size: 22px; font-weight: 700; color: #ffffff; margin-bottom: 12px; }
        .desc { font-size: 14px; color: #9ca3af; line-height: 1.5; margin-bottom: 24px; }
        .otp-box { background: #1a1e24; border: 1.5px dashed #4f46e5; border-radius: 8px; padding: 16px 20px; display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #ffffff; margin: 16px 0; font-family: monospace; }
        .footer { font-size: 12px; color: #6b7280; margin-top: 24px; border-top: 1px solid #282a2f; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">StudyMind AI</div>
        <div class="title">Verify Your Email Address</div>
        <div class="desc">Hello ${userName}, use the 6-digit verification code below to activate your StudyMind student account.</div>
        <div class="otp-box">${otpCode}</div>
        <div class="desc" style="font-size: 13px;">This code will expire in <strong>10 minutes</strong>. Do not share this code with anyone.</div>
        <div class="footer">If you didn't create an account with StudyMind, please safely ignore this email.</div>
      </div>
    </body>
    </html>
  `;

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"StudyMind AI" <${process.env.SMTP_USER || process.env.GMAIL_USER || 'no-reply@studymind.ai'}>`,
        to: toEmail,
        subject: `${otpCode} is your StudyMind verification code`,
        text: `Your StudyMind verification code is: ${otpCode}. It expires in 10 minutes.`,
        html: htmlContent
      });
      console.log(`[EMAIL SERVICE] OTP email delivered to ${toEmail}. MessageId: ${info.messageId}`);
      return { success: true, delivered: true };
    } catch (err) {
      console.error(`[EMAIL SERVICE ERROR] Failed to send email via SMTP:`, err.message);
      // Fallback logging
      console.log(`[EMAIL SERVICE FALLBACK] OTP for ${toEmail}: ${otpCode}`);
      return { success: true, delivered: false, fallbackOtp: otpCode, error: err.message };
    }
  } else {
    console.log(`[EMAIL SERVICE NOTICE] SMTP credentials not set. OTP for ${toEmail}: ${otpCode}`);
    return { success: true, delivered: false, fallbackOtp: otpCode, notice: 'SMTP credentials not configured. OTP generated.' };
  }
}
