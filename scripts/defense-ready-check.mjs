/**
 * Defense readiness probe — checks Supabase auth + critical tables/columns.
 * Usage: node scripts/defense-ready-check.mjs
 * Reads apps/web/.env.local (does not print secrets).
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
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) throw new Error('Missing Supabase URL/key');

const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const checks = [];
function ok(name, pass, detail = '') {
  checks.push({ name, pass, detail });
  console.log(`${pass ? 'OK ' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

const tables = [
  'profiles',
  'companies',
  'jobs',
  'applications',
  'courses',
  'course_modules',
  'course_lessons',
  'course_enrollments',
  'course_quizzes',
  'feed_posts',
  'messages',
  'assessments',
  'assessment_submissions',
  'content_reports',
  'company_follows',
  'certificates_issued',
  'cv_files',
];

for (const table of tables) {
  const select = table === 'company_follows' ? 'user_id,company_id' : 'id';
  const { error } = await sb.from(table).select(select).limit(1);
  ok(`table:${table}`, !error, error?.message || '');
}

const columnProbes = [
  ['applications', 'meeting_url'],
  ['messages', 'attachment_url'],
  ['course_lessons', 'video_url'],
  ['assessments', 'questions'],
  ['companies', 'employees_count'],
  ['feed_posts', 'image_url'],
];

for (const [table, col] of columnProbes) {
  const { error } = await sb.from(table).select(col).limit(1);
  ok(`column:${table}.${col}`, !error, error?.message || '');
}

const { data: buckets, error: bucketErr } = await sb.storage.listBuckets();
if (bucketErr) {
  ok('storage:list', false, bucketErr.message);
} else {
  const names = (buckets ?? []).map((b) => b.name);
  ok('bucket:cvs', names.includes('cvs'), names.join(',') || 'none');
  ok('bucket:media', names.includes('media'), names.join(',') || 'none');
}

const mobileEnv = path.join(root, 'apps/mobile/.env');
ok('mobile:.env', fs.existsSync(mobileEnv), mobileEnv);

const failed = checks.filter((c) => !c.pass);
console.log('\n---');
console.log(`Passed ${checks.length - failed.length}/${checks.length}`);
if (failed.length) {
  console.log('Still failing:');
  for (const f of failed) console.log(` - ${f.name}: ${f.detail}`);
  console.log('\nIf columns/tables fail: run supabase/scripts/defense_repair_013_015.sql in SQL Editor.');
  console.log('If media bucket fails: create public bucket "media" or run create_media_bucket.sql');
  process.exitCode = 1;
} else {
  console.log('Defense probe: ALL GREEN');
}
