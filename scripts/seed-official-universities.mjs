/**
 * Seed the official Palestinian university catalog and active internal
 * partnership-portal accounts.
 *
 * Data source: Palestinian Ministry of Education and Higher Education
 * https://www.mohe.pna.ps/Higher-Education/Institutions/Universities
 *
 * The created accounts use the Naqla domain and are explicitly internal
 * portal accounts. They must be handed over only after an authorized
 * university representative has verified ownership.
 *
 * Usage:
 *   UNIVERSITY_PORTAL_PASSWORD="..." node scripts/seed-official-universities.mjs
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
    const splitAt = trimmed.indexOf('=');
    if (splitAt < 0) continue;
    const key = trimmed.slice(0, splitAt).trim();
    const value = trimmed.slice(splitAt + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

const MINISTRY_DIRECTORY =
  'https://www.mohe.pna.ps/Higher-Education/Institutions/Universities';

const UNIVERSITIES = [
  { code: 'BZU', name: 'جامعة بيرزيت', nameEn: 'Birzeit University', city: 'Birzeit', website: 'https://www.birzeit.edu' },
  { code: 'ANU', name: 'جامعة النجاح الوطنية', nameEn: 'An-Najah National University', city: 'Nablus', website: 'https://www.najah.edu' },
  { code: 'AQU', name: 'جامعة القدس', nameEn: 'Al-Quds University', city: 'Jerusalem', website: 'https://www.alquds.edu' },
  { code: 'QOU', name: 'جامعة القدس المفتوحة', nameEn: 'Al-Quds Open University', city: 'Ramallah', website: 'https://www.qou.edu' },
  { code: 'PPU', name: 'جامعة بوليتكنك فلسطين', nameEn: 'Palestine Polytechnic University', city: 'Hebron', website: 'https://www.ppu.edu' },
  { code: 'AAUP', name: 'الجامعة العربية الأمريكية', nameEn: 'Arab American University', city: 'Jenin', website: 'https://www.aaup.edu' },
  { code: 'HU', name: 'جامعة الخليل', nameEn: 'Hebron University', city: 'Hebron', website: 'https://www.hebron.edu' },
  { code: 'BU', name: 'جامعة بيت لحم', nameEn: 'Bethlehem University', city: 'Bethlehem', website: 'https://www.bethlehem.edu' },
  { code: 'IUG', name: 'الجامعة الإسلامية بغزة', nameEn: 'Islamic University of Gaza', city: 'Gaza', website: 'https://www.iugaza.edu.ps' },
  { code: 'AUG', name: 'جامعة الأزهر - غزة', nameEn: 'Al-Azhar University - Gaza', city: 'Gaza', website: 'https://www.alazhar.edu.ps' },
  { code: 'AQSA', name: 'جامعة الأقصى', nameEn: 'Al-Aqsa University', city: 'Gaza', website: 'https://www.alaqsa.edu.ps' },
  { code: 'PTUK', name: 'جامعة فلسطين التقنية - خضوري', nameEn: 'Palestine Technical University - Kadoorie', city: 'Tulkarm', website: 'https://www.ptuk.edu.ps' },
];

function internalPortalEmail(code) {
  return `partnership+${code.toLowerCase()}@naqlah.ps`;
}

async function upsertPortalUser(admin, university, universityId, password) {
  const email = internalPortalEmail(university.code);
  const { data: listed, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) throw listError;
  const existing = listed.users.find((user) => user.email?.toLowerCase() === email);
  const metadata = {
    full_name: `${university.name} — بوابة الشراكة`,
    role: 'university',
    account_kind: 'internal_partnership_portal',
    institution_code: university.code,
    institution_source: MINISTRY_DIRECTORY,
  };

  let id = existing?.id;
  if (id) {
    const { error } = await admin.auth.admin.updateUserById(id, {
      password,
      email_confirm: true,
      user_metadata: metadata,
    });
    if (error) throw error;
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: metadata,
    });
    if (error || !data.user) throw error ?? new Error(`Could not create ${email}`);
    id = data.user.id;
  }

  const { error: profileError } = await admin.from('profiles').upsert({
    id,
    email,
    full_name: metadata.full_name,
    roles: ['university'],
    active_role: 'university',
    status: 'active',
    organization_id: universityId,
    email_verified: true,
  });
  if (profileError) throw profileError;
  return email;
}

async function main() {
  loadEnvLocal();
  const password = process.env.UNIVERSITY_PORTAL_PASSWORD;
  if (!password || password.length < 8) {
    throw new Error('Set UNIVERSITY_PORTAL_PASSWORD to a password of at least 8 characters.');
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error('Supabase environment variables are missing.');
  const admin = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  for (const university of UNIVERSITIES) {
    const { data, error } = await admin
      .from('universities')
      .upsert(
        {
          name: university.name,
          name_en: university.nameEn,
          code: university.code,
          city: university.city,
          website: university.website,
        },
        { onConflict: 'code' },
      )
      .select('id')
      .single();
    if (error || !data) throw error ?? new Error(`Could not seed ${university.code}`);

    const email = await upsertPortalUser(admin, university, data.id, password);
    console.log(`active internal portal: ${university.code} → ${email}`);
  }
  console.log(`Seeded ${UNIVERSITIES.length} official university records from the Ministry directory.`);
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exitCode = 1;
});
