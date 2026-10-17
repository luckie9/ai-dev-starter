/**
 * Applies supabase/migrations/001_initial_schema.sql over a direct Postgres
 * connection derived from SUPABASE_URL, then verifies via the service-role
 * (or secret) Data API key from .env.local.
 *
 * Usage:
 *   node --env-file=.env.local scripts/apply-migration-direct.mjs
 *   npm run db:migrate:direct
 *
 * Required in .env.local:
 *   SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY  (Data API verification)
 *   SUPABASE_DB_PASSWORD or DATABASE_URL              (direct Postgres DDL)
 *
 * Note: Supabase URL + service-role/secret API keys authenticate to PostgREST,
 * not the Postgres wire protocol. Executing DDL requires the database password
 * (Project Settings → Database) or a full DATABASE_URL.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

const MIGRATION_PATH = resolve(
  process.cwd(),
  'supabase/migrations/001_initial_schema.sql',
);

function getSupabaseUrl() {
  return (
    process.env.SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    ''
  );
}

function getServiceRoleKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    ''
  );
}

function getProjectRef(supabaseUrl) {
  const match = supabaseUrl.match(/^https:\/\/([a-z0-9-]+)\.supabase\.co/i);
  if (!match) {
    throw new Error(
      `Could not parse project ref from SUPABASE_URL: ${supabaseUrl}`,
    );
  }
  return match[1];
}

function buildPgConfig(supabaseUrl) {
  if (process.env.DATABASE_URL?.trim()) {
    return { connectionString: process.env.DATABASE_URL.trim() };
  }

  const password =
    process.env.SUPABASE_DB_PASSWORD?.trim() ||
    process.env.POSTGRES_PASSWORD?.trim() ||
    '';

  if (!password) {
    throw new Error(
      [
        'Direct SQL execution needs a Postgres password.',
        'SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SECRET_KEY only authenticate the Data API (PostgREST), not Postgres.',
        'Add one of these to .env.local and re-run:',
        '  SUPABASE_DB_PASSWORD=<database password from Supabase → Project Settings → Database>',
        '  DATABASE_URL=postgresql://postgres.<ref>:<password>@aws-1-<region>.pooler.supabase.com:6543/postgres',
      ].join('\n'),
    );
  }

  const ref = getProjectRef(supabaseUrl);
  const poolerHost =
    process.env.SUPABASE_POOLER_HOST?.trim() ||
    'aws-1-ca-central-1.pooler.supabase.com';

  return {
    host: poolerHost,
    port: Number(process.env.SUPABASE_DB_PORT || 6543),
    database: 'postgres',
    user: `postgres.${ref}`,
    password,
    ssl: { rejectUnauthorized: false },
  };
}

async function applyMigration(client, sql) {
  // Run as a single script so dependent statements stay ordered.
  await client.query(sql);
}

async function verifyWithServiceRole(supabaseUrl, serviceKey) {
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const tables = ['products', 'subscriptions', 'users'];
  for (const table of tables) {
    const { error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      throw new Error(`Post-migration verify failed for ${table}: ${error.message}`);
    }
    console.log(`Verified public.${table} via service-role/secret key`);
  }
}

async function main() {
  const supabaseUrl = getSupabaseUrl();
  const serviceKey = getServiceRoleKey();

  if (!supabaseUrl) {
    throw new Error('Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) in .env.local');
  }
  if (!serviceKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY) in .env.local',
    );
  }

  const sql = readFileSync(MIGRATION_PATH, 'utf8');
  const pgConfig = buildPgConfig(supabaseUrl);

  console.log(`Reading migration: ${MIGRATION_PATH}`);
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(
    pgConfig.connectionString
      ? 'Connecting via DATABASE_URL'
      : `Connecting via pooler ${pgConfig.host} as ${pgConfig.user}`,
  );

  const client = new pg.Client(pgConfig);
  await client.connect();

  try {
    await applyMigration(client, sql);
    console.log('Migration SQL executed successfully.');
  } finally {
    await client.end();
  }

  await verifyWithServiceRole(supabaseUrl, serviceKey);
  console.log('Schema ready.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
