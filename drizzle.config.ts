import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL || 'file:./local.db';

export default defineConfig({
  schema: './drizzle/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: connectionString,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
});
