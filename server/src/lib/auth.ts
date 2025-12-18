import { betterAuth } from 'better-auth';
import { jwt } from 'better-auth/plugins';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import config from '../config';
import { db } from '../db/index';

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
      clientId: config.googleSignInConfig.clientId,
      clientSecret: config.googleSignInConfig.clientSecret,
    },
  },
});
