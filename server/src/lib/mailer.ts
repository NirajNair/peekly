import nodemailer from 'nodemailer';
import config from '../config';

export const transporter = nodemailer.createTransport({
  host: config.smtpConfig.host,
  port: config.smtpConfig.port,
  secure: false, // true for 465
  auth: config.smtpConfig.auth,
});

export async function verifySmtpConnection(): Promise<void> {
  try {
    await transporter.verify();
    console.log('SMTP server connection verified successfully');
  } catch (error) {
    console.error('SMTP server connection failed:', error);
    throw new Error(
      `Failed to connect to SMTP server: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
