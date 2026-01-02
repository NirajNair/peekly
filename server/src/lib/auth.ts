import { betterAuth, User } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { jwt } from 'better-auth/plugins';
import config from '../config';
import { db } from '../db/index';
import { sendResetPasswordEmail, sendVerificationEmail } from './email';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: true,
    debugLogs: true,
    transaction: true,
  }),
  plugins: [jwt()],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    google: {
      enabled: true,
      clientId: config.googleOAuthConfig.clientId,
      clientSecret: config.googleOAuthConfig.clientSecret,
    },
  },
  emailVerification: {
    async sendVerificationEmail(data: { user: User; url: string; token: string }) {
      await sendVerificationEmail(data.user.email, data.url, data.user.name);
    },
  },
  resetPassword: {
    async sendResetPasswordEmail(data: { user: User; url: string; token: string }) {
      await sendResetPasswordEmail(data.user.email, data.url, data.user.name);
    },
  },
});
