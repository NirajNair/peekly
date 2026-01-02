import { transporter } from './mailer';

export async function sendVerificationEmail(
  emailId: string,
  verificationUrl: string,
  userName = ''
) {
  const greeting = userName ? `Hi ${userName}` : 'Hello';

  await transporter.sendMail({
    from: `"Peekly" <no-reply@peekly.com>`,
    to: emailId,
    subject: 'Verify your email - Peekly',
    text: `
        ${greeting},

        Welcome to Peekly! 

        To complete your registration, please verify your email address by clicking the link below:

        ${verificationUrl}

        This verification link will expire in 24 hours for security reasons.

        If you didn't create an account with Peekly, you can safely ignore this email.

        Best regards,
        The Peekly Team
    `.trim(),
  });
}

export async function sendResetPasswordEmail(
  emailId: string,
  resetPasswordUrl: string,
  userName = ''
) {
  const greeting = userName ? `Hi ${userName}` : 'Hello';

  await transporter.sendMail({
    from: `"Peekly" <no-reply@peekly.com>`,
    to: emailId,
    subject: 'Reset your password - Peekly',
    text: `
        ${greeting},

        Welcome to Peekly! 

        To reset your password, please click the link below:

        ${resetPasswordUrl}

        This link will expire in 24 hours for security reasons.

        If you didn't request a password reset, you can safely ignore this email.

        Best regards,
        Peekly Team
    `.trim(),
  });
}