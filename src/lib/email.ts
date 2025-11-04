import nodemailer from 'nodemailer';

export type EmailProvider = 'gmail' | 'sendgrid' | 'custom';

interface EmailConfig {
  provider: EmailProvider;
  host?: string;
  port?: number;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

let transporter: nodemailer.Transporter | null = null;

function getEmailConfig(): EmailConfig {
  const provider = (process.env.EMAIL_PROVIDER || 'gmail') as EmailProvider;

  switch (provider) {
    case 'gmail':
      return {
        provider: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
          user: process.env.GMAIL_EMAIL || '',
          pass: process.env.GMAIL_APP_PASSWORD || '',
        },
        from: process.env.GMAIL_EMAIL || '',
      };

    case 'sendgrid':
      return {
        provider: 'sendgrid',
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY || '',
        },
        from: process.env.SENDGRID_FROM_EMAIL || '',
      };

    case 'custom':
      return {
        provider: 'custom',
        host: process.env.SMTP_HOST || '',
        port: parseInt(process.env.SMTP_PORT || '587'),
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASSWORD || '',
        },
        from: process.env.SMTP_FROM_EMAIL || '',
      };

    default:
      throw new Error('Invalid email provider configuration');
  }
}

export function initializeEmailTransport() {
  if (transporter) return transporter;

  const config = getEmailConfig();
  
  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: config.auth,
  });

  return transporter;
}

export async function sendOTPEmail(
  email: string,
  otp: string,
  userName?: string | null
): Promise<void> {
  try {
    const transport = initializeEmailTransport();
    const config = getEmailConfig();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .header { text-align: center; color: #333; margin-bottom: 20px; }
            .otp-box { background-color: #f9f9f9; border: 2px solid #2563eb; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 36px; font-weight: bold; color: #2563eb; letter-spacing: 5px; }
            .note { color: #666; font-size: 14px; margin-top: 20px; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎫 Bus Ticket Booking</h1>
              <h2>Email Verification</h2>
            </div>
            <p>Hi ${userName || 'User'},</p>
            <p>Your one-time password (OTP) for email verification is:</p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            <div class="note">
              <p><strong>⏱️ Valid for 10 minutes only</strong></p>
              <p>This OTP is for security purposes. Do not share it with anyone.</p>
              <p>If you didn't request this, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 Bus Ticket Booking. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await transport.sendMail({
      from: config.from,
      to: email,
      subject: 'Your OTP Code - Bus Ticket Booking',
      html: htmlContent,
      text: `Your OTP code is: ${otp}. Valid for 10 minutes only.`,
    });

    console.log('Email sent:', result.messageId);
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
}

export async function verifyEmailConfig(): Promise<boolean> {
  try {
    const transport = initializeEmailTransport();
    await transport.verify();
    console.log('✅ Email configuration verified');
    return true;
  } catch (error) {
    console.error('❌ Email configuration failed:', error);
    return false;
  }
}
