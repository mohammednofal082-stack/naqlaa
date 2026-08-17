/**
 * Sync events.registered_count from event_registrations rows.
 * Usage: node scripts/sync-event-counts.mjs
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
if (!url || !key) throw new Error('Missing Supabase URL or SUPABASE_SERVICE_ROLE_KEY');

const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const { data: events, error: eventsError } = await admin.from('events').select('id, title, registered_count');
if (eventsError) throw eventsError;

let updated = 0;
for (const event of events ?? []) {
  const { count, error } = await admin
    .from('event_registrations')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', event.id);
  if (error) throw error;
  const next = count ?? 0;
  if (Number(event.registered_count ?? 0) === next) continue;
  const { error: updateError } = await admin
    .from('events')
    .update({ registered_count: next })
    .eq('id', event.id);
  if (updateError) throw updateError;
  updated += 1;
  console.log(`Updated ${event.title}: ${event.registered_count} -> ${next}`);
}

console.log(`Done. ${updated} event(s) synced.`);
