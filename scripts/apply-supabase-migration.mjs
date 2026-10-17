/**
 * Applies supabase/migrations/001_initial_schema.sql via the Supabase
 * Management API (requires SUPABASE_ACCESS_TOKEN).
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=sbp_... node --env-file=.env.local scripts/apply-supabase-migration.mjs
 *   npm run db:migrate
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const PROJECT_REF =
  process.env.SUPABASE_PROJECT_REF ||
  process.env.NEXT_PUBLIC_SUPABASE_URL?.match(
    /^https:\/\/([a-z0-9]+)\.supabase\.co/i,
  )?.[1];

const MIGRATION_PATH = resolve(
  process.cwd(),
  'supabase/migrations/001_initial_schema.sql',
);

async function runQuery(accessToken, projectRef, query) {
  const response = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    },
  );

  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }

  if (!response.ok) {
    const detail =
      typeof body === 'string' ? body : JSON.stringify(body, null, 2);
    throw new Error(`Management API ${response.status}: ${detail}`);
  }

  return body;
}

async function main() {
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  if (!accessToken) {
    throw new Error(
      'Missing SUPABASE_ACCESS_TOKEN. Create one at https://supabase.com/dashboard/account/tokens',
    );
  }

  if (!PROJECT_REF) {
    throw new Error(
      'Could not determine project ref. Set SUPABASE_PROJECT_REF or NEXT_PUBLIC_SUPABASE_URL.',
    );
  }

  const sql = readFileSync(MIGRATION_PATH, 'utf8');
  console.log(`Applying ${MIGRATION_PATH}`);
  console.log(`Project: ${PROJECT_REF}`);

  const result = await runQuery(accessToken, PROJECT_REF, sql);
  console.log('Migration applied successfully.');
  if (result != null) {
    console.log(typeof result === 'string' ? result : JSON.stringify(result, null, 2));
  }

  // Verify tables exist
  const tables = await runQuery(
    accessToken,
    PROJECT_REF,
    `select table_name
     from information_schema.tables
     where table_schema = 'public'
       and table_name in ('products', 'subscriptions', 'users')
     order by table_name;`,
  );
  console.log('Public tables:');
  console.log(JSON.stringify(tables, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
