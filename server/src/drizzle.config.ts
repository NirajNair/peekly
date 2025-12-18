import { defineConfig } from 'drizzle-kit';
import config from './config';

export default defineConfig({
  out: '../drizzle',
  schema: '../src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: config.supabaseConfig.url,
  },
  casing: 'snake_case',
});
