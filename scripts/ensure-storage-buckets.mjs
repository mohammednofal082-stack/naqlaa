/**
 * Ensure Storage buckets cvs + media exist (public).
 * Usage: node scripts/ensure-storage-buckets.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const requireFromWeb = createRequire(path.join(root, 'apps/web/package.json'));
const { createClient } = requireFromWeb('@supabase/supabase-js');

function loadEnvLocal() {
  const envPath = path.join(root, 'apps/web/.env.local');
  if (!fs.existsSync(envPath)) throw new Error('Missing apps/web/.env.local');
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const i = trimmed.indexOf('=');
    if (i < 0) continue;
    const key = trimmed.slice(0, i).trim();
    let val = trimmed.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('Need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY');

const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: existing, error: listErr } = await sb.storage.listBuckets();
if (listErr) throw listErr;
const names = new Set((existing ?? []).map((b) => b.name));
console.log('current buckets:', [...names].join(', ') || '(none)');

for (const name of ['cvs', 'media']) {
  if (names.has(name)) {
    console.log('OK exists', name);
    continue;
  }
  const { error } = await sb.storage.createBucket(name, { public: true, fileSizeLimit: 10 * 1024 * 1024 });
  if (error) {
    console.error('FAIL', name, error.message);
    process.exitCode = 1;
  } else {
    console.log('CREATED', name);
  }
}
