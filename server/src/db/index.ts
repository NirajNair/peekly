import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import config from '../config';
import * as schema from './schema';

const client = postgres(config.databaseUrl, {
  prepare: false,
  max: 10, // Maximum number of connections
  idle_timeout: 20, // Close idle connections after 20s
  connect_timeout: 10, // Timeout(sec) for establishing connection
});

export const db = drizzle({ client, schema });
