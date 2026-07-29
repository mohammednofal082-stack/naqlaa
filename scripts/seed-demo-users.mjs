/**
 * Create demo auth users in Supabase for committee login.
 *
 * Usage (from repo root, with apps/web/.env.local filled):
 *   node scripts/seed-demo-users.mjs
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 * Password for all: Naqlah@2025
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
  if (!fs.existsSync(envPath)) {
    throw new Error('Missing apps/web/.env.local');
  }
  const text = fs.readFileSync(envPath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
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

const PASSWORD = 'Naqlah@2025';
const ASAL = 'a1111111-1111-1111-1111-111111111111';
const JAWAL = 'a3333333-3333-3333-3333-333333333333';
const INTERN = 'c1111111-1111-1111-1111-111111111111';
const JOB = 'b1111111-1111-1111-1111-111111111111';

const DEMO_USERS = [
  {
    email: 'student@naqlah.ps',
    fullName: 'محمد نوفل',
    role: 'student',
    organizationId: null,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MohammadNofal',
  },
  {
    email: 'graduate@naqlah.ps',
    fullName: 'أمير أبو شمس',
    role: 'graduate',
    organizationId: null,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ameer',
  },
  {
    email: 'company@jawwal.ps',
    fullName: 'Jawwal - بوابة الشركات',
    role: 'company',
    organizationId: JAWAL,
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=JW&backgroundColor=2563EB',
  },
  {
    email: 'hr@jawwal.ps',
    fullName: 'محمد عبدالله - HR',
    role: 'hr',
    organizationId: JAWAL,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HR',
  },
  {
    email: 'career@birzeit.edu',
    fullName: 'جامعة النجاح - مركز التوظيف',
    role: 'university',
    organizationId: null,
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=NJ&backgroundColor=10B981',
  },
  {
    email: 'trainer@naqlah.ps',
    fullName: 'د. كريم ناصر',
    role: 'trainer',
    organizationId: null,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Karim',
  },
  {
    email: 'mentor@naqlah.ps',
    fullName: 'لينا أبو غزالة',
    role: 'mentor',
    organizationId: null,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lina',
  },
  {
    email: 'admin@naqlah.ps',
    fullName: 'مدير النظام',
    role: 'admin',
    organizationId: null,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
  },
];

async function upsertUser(admin, demo) {
  const list = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const existing = list.data?.users?.find((u) => u.email?.toLowerCase() === demo.email.toLowerCase());

  let userId = existing?.id;
  if (!userId) {
    const created = await admin.auth.admin.createUser({
      email: demo.email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: demo.fullName,
        role: demo.role,
        avatar_url: demo.avatar,
      },
    });
    if (created.error) throw created.error;
    userId = created.data.user.id;
    console.log(`created ${demo.email}`);
  } else {
    const updated = await admin.auth.admin.updateUserById(userId, {
      password: PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: demo.fullName,
        role: demo.role,
        avatar_url: demo.avatar,
      },
    });
    if (updated.error) throw updated.error;
    console.log(`updated ${demo.email}`);
  }

  const { error: profileError } = await admin.from('profiles').upsert({
    id: userId,
    email: demo.email,
    full_name: demo.fullName,
    avatar_url: demo.avatar,
    roles: [demo.role],
    active_role: demo.role,
    status: 'active',
    organization_id: demo.organizationId,
    email_verified: true,
  });
  if (profileError) throw profileError;

  if (demo.role === 'student' || demo.role === 'graduate') {
    const { error: spError } = await admin.from('student_profiles').upsert({
      user_id: userId,
      headline: demo.role === 'graduate' ? 'Full Stack Developer' : 'Computer Science Student',
      location: 'نابلس',
      about: 'حساب تجريبي لمنصة نقلة',
      university_id: 'an-najah',
      major: 'هندسة حاسوب',
      graduation_year: demo.role === 'graduate' ? 2025 : 2027,
      skills: ['React', 'TypeScript', 'Node.js'],
      profile_completion: 85,
    });
    if (spError) throw spError;
  }

  return userId;
}

async function seedDemoData(admin, studentId) {
  // Sample application for HR/company pipeline demo
  await admin.from('applications').upsert(
    {
      id: 'ac111111-1111-1111-1111-111111111111',
      student_id: studentId,
      job_id: JOB,
      company_id: ASAL,
      status: 'applied',
      match_score: 82,
      cover_letter: 'مهتم بفرصة Frontend في Asal.',
    },
    { onConflict: 'id' },
  );

  // Also apply student to Jawwal job so company@jawwal sees applicants
  await admin.from('applications').upsert(
    {
      id: 'ac222222-2222-2222-2222-222222222222',
      student_id: studentId,
      job_id: 'b3333333-3333-3333-3333-333333333333',
      company_id: JAWAL,
      status: 'under_review',
      match_score: 76,
      cover_letter: 'طلب تجريبي لعرض شركة جوال.',
    },
    { onConflict: 'id' },
  );

  const { data: existingReq } = await admin
    .from('internship_requests')
    .select('id')
    .eq('student_id', studentId)
    .eq('internship_id', INTERN)
    .maybeSingle();

  let requestId = existingReq?.id;
  if (!requestId) {
    const { data, error } = await admin
      .from('internship_requests')
      .insert({
        student_id: studentId,
        university_id: 'an-najah',
        company_id: ASAL,
        internship_id: INTERN,
        status: 'in_progress',
        start_date: new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10),
        end_date: new Date(Date.now() + 60 * 86400000).toISOString().slice(0, 10),
      })
      .select('id')
      .single();
    if (error) throw error;
    requestId = data.id;
  }

  await admin.from('weekly_reports').upsert(
    {
      id: 'ad111111-1111-1111-1111-111111111111',
      internship_request_id: requestId,
      week_number: 1,
      title: 'Week 1',
      tasks_done: 'التعرف على الفريق وإعداد بيئة التطوير.',
      challenges: 'ضبط الصلاحيات على المستودع.',
      status: 'approved',
    },
    { onConflict: 'id' },
  );

  // One unverified company for admin verification queue
  await admin.from('companies').upsert({
    id: 'a4444444-4444-4444-4444-444444444444',
    name: 'Startup Palestine Demo',
    industry: 'Technology',
    description: 'شركة تجريبية بانتظار اعتماد الأدمن.',
    logo_url: 'https://api.dicebear.com/7.x/initials/svg?seed=SP',
    location: 'نابلس',
    size: '1-10',
    verified: false,
  });
}

async function main() {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let studentId = null;
  for (const demo of DEMO_USERS) {
    const id = await upsertUser(admin, demo);
    if (demo.role === 'student') studentId = id;
  }

  if (studentId) {
    await seedDemoData(admin, studentId);
    console.log('seeded sample applications, internship request, weekly report');
  }

  console.log('\nDemo password for all accounts:', PASSWORD);
  console.log(DEMO_USERS.map((u) => `${u.role.padEnd(10)} ${u.email}`).join('\n'));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
