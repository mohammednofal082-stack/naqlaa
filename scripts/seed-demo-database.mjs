/**
 * Populate Supabase with a comprehensive, internally-labelled demonstration
 * dataset. All records are stored in Supabase, never read from the app's
 * in-memory mock store.
 *
 * Usage:
 *   DEMO_DATA_PASSWORD="Naqlah@2025" node scripts/seed-demo-database.mjs
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
  for (const line of fs.readFileSync(path.join(root, 'apps/web/.env.local'), 'utf8').split(/\r?\n/)) {
    const i = line.indexOf('=');
    if (i > 0 && !line.trim().startsWith('#') && !process.env[line.slice(0, i).trim()]) {
      process.env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }
}

const ID = {
  companies: ['10000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000006'],
  jobs: Array.from({ length: 40 }, (_, i) => `20000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`),
  internships: Array.from({ length: 20 }, (_, i) => `30000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`),
  courses: Array.from({ length: 12 }, (_, i) => `40000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`),
  events: Array.from({ length: 15 }, (_, i) => `50000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`),
  pools: Array.from({ length: 12 }, (_, i) => `60000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`),
};

const PEOPLE = [
  ['demo.student.1@naqlah.ps', 'سارة الخطيب', 'student'],
  ['demo.student.2@naqlah.ps', 'ليان حماد', 'student'],
  ['demo.student.3@naqlah.ps', 'أحمد سلامة', 'student'],
  ['demo.student.4@naqlah.ps', 'تالا أبو عودة', 'student'],
  ['demo.student.5@naqlah.ps', 'عمر ناصر', 'student'],
  ['demo.student.6@naqlah.ps', 'ريم يوسف', 'student'],
  ['demo.graduate.1@naqlah.ps', 'ميرا عبد الله', 'graduate'],
  ['demo.graduate.2@naqlah.ps', 'يزن بركات', 'graduate'],
  ['demo.graduate.3@naqlah.ps', 'نور الدين حداد', 'graduate'],
  ['demo.graduate.4@naqlah.ps', 'هبة عوض', 'graduate'],
  ['demo.trainer@naqlah.ps', 'رائد منصور', 'trainer'],
  ['demo.mentor@naqlah.ps', 'دانا سمارة', 'mentor'],
  ['demo.hr@naqlah.ps', 'هاني شرف', 'hr'],
  ...Array.from({ length: 40 }, (_, index) => [
    `demo.talent.${String(index + 1).padStart(2, '0')}@naqlah.ps`,
    `مستخدم عرض ${String(index + 1).padStart(2, '0')}`,
    index % 5 === 0 ? 'graduate' : 'student',
  ]),
];

const COMPANY_NAMES = [
  ['Future Stack', 'Technology', 'رام الله'],
  ['Cedar Finance', 'Finance', 'نابلس'],
  ['Olive Health', 'Healthcare', 'الخليل'],
  ['North Star Studio', 'Design', 'رام الله'],
  ['Bridge Logistics', 'Logistics', 'طولكرم'],
  ['Horizon Education', 'Education', 'بيت لحم'],
];

const JOB_TEMPLATES = [
  ['Frontend Developer', 'Technology', 'React, TypeScript وواجهات ويب متجاوبة.', ['React', 'TypeScript', 'CSS', 'Git'], 'hybrid', 'junior'],
  ['Data Analyst', 'Finance', 'تحليل بيانات الأعمال وإعداد لوحات متابعة.', ['SQL', 'Excel', 'Power BI', 'Analysis'], 'on-site', 'junior'],
  ['UI/UX Designer', 'Design', 'تصميم تجارب رقمية واختبار واجهات المستخدم.', ['Figma', 'Research', 'Prototyping'], 'hybrid', 'junior'],
  ['Backend Developer', 'Technology', 'بناء واجهات API وخدمات آمنة وقابلة للتوسع.', ['Node.js', 'PostgreSQL', 'REST', 'Docker'], 'remote', 'mid'],
  ['Operations Coordinator', 'Logistics', 'متابعة عمليات التوريد والتقارير اليومية.', ['Operations', 'Communication', 'Excel'], 'on-site', 'entry'],
  ['Digital Marketing Specialist', 'Marketing', 'إدارة الحملات الرقمية وتحليل الأداء.', ['SEO', 'Content', 'Analytics'], 'hybrid', 'junior'],
];

async function upsert(sb, table, rows, onConflict = 'id') {
  if (!rows.length) return [];
  const { data, error } = await sb.from(table).upsert(rows, { onConflict }).select();
  if (error) throw new Error(`${table}: ${error.message}`);
  return data ?? [];
}

async function ensureUser(admin, [email, fullName, role], password, existingUsers) {
  let authUser = existingUsers.get(email);
  const metadata = { full_name: fullName, role, account_kind: 'demo_seed' };
  if (authUser) {
    const { data, error } = await admin.auth.admin.updateUserById(authUser.id, {
      password, email_confirm: true, user_metadata: metadata,
    });
    if (error) throw error;
    authUser = data.user;
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email, password, email_confirm: true, user_metadata: metadata,
    });
    if (error || !data.user) throw error ?? new Error(`Could not create ${email}`);
    authUser = data.user;
    existingUsers.set(email, authUser);
  }
  await upsert(admin, 'profiles', [{
    id: authUser.id, email, full_name: fullName, roles: [role], active_role: role,
    status: 'active', email_verified: true,
  }]);
  return authUser.id;
}

function future(days) {
  return new Date(Date.now() + days * 86400000).toISOString();
}

function past(days) {
  return new Date(Date.now() - days * 86400000).toISOString();
}

async function main() {
  loadEnvLocal();
  const password = process.env.DEMO_DATA_PASSWORD || 'Naqlah@2025';
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase environment variables are missing.');
  }

  const ids = {};
  const { data: existing, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) throw listError;
  const existingUsers = new Map(existing.users
    .filter((user) => user.email)
    .map((user) => [user.email.toLowerCase(), user]));
  for (const person of PEOPLE) ids[person[0]] = await ensureUser(admin, person, password, existingUsers);
  const studentIds = PEOPLE.filter((p) => p[2] === 'student' || p[2] === 'graduate').map((p) => ids[p[0]]);
  const trainerId = ids['demo.trainer@naqlah.ps'];
  const mentorId = ids['demo.mentor@naqlah.ps'];
  const hrId = ids['demo.hr@naqlah.ps'];

  const companies = COMPANY_NAMES.map(([name, industry, location], index) => ({
    id: ID.companies[index],
    owner_id: index === 0 ? hrId : null,
    name, industry, location,
    description: `بيانات عرض داخلية لشركة ${name} لتجربة مسارات منصة نقلة.`,
    website: `https://example.invalid/${name.toLowerCase().replace(/\s/g, '-')}`,
    email: `contact+${index + 1}@naqlah.ps`,
    size: ['11-50', '51-200', '51-200', '11-50', '201-500', '11-50'][index],
    verified: true, employees_count: 30 + index * 18, founded_year: 2010 + index,
  }));
  await upsert(admin, 'companies', companies);

  const roleProfiles = studentIds.map((userId, index) => ({
    user_id: userId,
    headline: index < 6 ? 'طالب/ة هندسة حاسوب' : 'خريج/ة تقنية معلومات',
    location: ['رام الله', 'نابلس', 'الخليل', 'بيت لحم'][index % 4],
    about: 'ملف عرض داخلي لتجربة رحلة الطالب والخريج في منصة نقلة.',
    university_id: index % 2 ? 'uni-birzeit' : 'uni-najah',
    major: ['علوم الحاسوب', 'هندسة الحاسوب', 'نظم المعلومات'][index % 3],
    graduation_year: 2025 + (index % 3),
    study_year: index < 6 ? 3 + (index % 2) : null,
    skills: ['React', 'TypeScript', 'SQL', 'Communication'],
    profile_completion: 68 + index * 3,
    employment_status: index > 7 ? 'employed' : 'seeking',
    employment_company: index > 7 ? companies[index % companies.length].name : null,
    employment_title: index > 7 ? 'Junior Developer' : null,
  }));
  await upsert(admin, 'student_profiles', roleProfiles, 'user_id');
  await upsert(admin, 'user_skills',
    studentIds.flatMap((userId, i) => ['React', 'TypeScript', 'SQL', 'Communication'].map((skill, j) => ({
      id: `70000000-0000-4000-8000-${String(i * 4 + j + 1).padStart(12, '0')}`,
      user_id: userId, skill_name: skill, level: 55 + ((i + j) * 7) % 40,
    }))), 'user_id,skill_name');
  await upsert(admin, 'user_settings', studentIds.map((user_id) => ({
    user_id, email_notifications: true, push_notifications: true, profile_public: true,
  })), 'user_id');
  const { data: universityRows, error: universityError } = await admin.from('universities').select('id');
  if (universityError) throw universityError;
  const colleges = universityRows.flatMap((university, universityIndex) => ['كلية الهندسة والتكنولوجيا', 'كلية الأعمال', 'كلية العلوم'].map((name, collegeIndex) => ({
    id: `11000000-0000-4000-8000-${String(universityIndex * 3 + collegeIndex + 1).padStart(12, '0')}`,
    university_id: university.id, name, code: `D${universityIndex + 1}${collegeIndex + 1}`,
  })));
  await upsert(admin, 'colleges', colleges);
  const departments = colleges.flatMap((college, collegeIndex) => ['علوم الحاسوب', 'نظم المعلومات'].map((name, departmentIndex) => ({
    id: `12000000-0000-4000-8000-${String(collegeIndex * 2 + departmentIndex + 1).padStart(12, '0')}`,
    college_id: college.id, name, code: `P${collegeIndex + 1}${departmentIndex + 1}`,
  })));
  await upsert(admin, 'departments', departments);

  const jobs = ID.jobs.map((id, index) => {
    const [title, industry, description, skills, workType, level] = JOB_TEMPLATES[index % JOB_TEMPLATES.length];
    return {
      id, company_id: companies[index % companies.length].id, title: `${title} ${index > 5 ? 'II' : ''}`.trim(),
      description: `[بيانات عرض] ${description}`, requirements: ['سيرة ذاتية محدثة', 'مهارات تواصل'], skills,
      salary_min: 900 + index * 150, salary_max: 1400 + index * 200, currency: 'USD',
      location: companies[index % companies.length].location, work_type: workType, job_type: index % 3 === 0 ? 'internship' : 'job',
      experience_level: level, industry, applicants_count: 3 + index * 4, status: 'published', posted_at: past(index + 2),
    };
  });
  await upsert(admin, 'jobs', jobs);
  await upsert(admin, 'internships', ID.internships.map((id, index) => ({
    id, company_id: companies[index % companies.length].id, title: `برنامج تدريب ${['البرمجيات', 'تحليل البيانات', 'التصميم', 'العمليات', 'التسويق', 'التعليم'][index % 6]}`,
    description: '[بيانات عرض] برنامج تدريبي لممارسة كل خطوات التدريب والمتابعة.',
    requirements: ['طالب سنة ثالثة أو رابعة', 'التزام 12 أسبوعاً'], duration: '12 weeks',
    paid: index % 2 === 0, salary: index % 2 === 0 ? 350 : 0, location: companies[index % companies.length].location,
    work_type: index % 2 ? 'on-site' : 'hybrid', train_to_hire: true, applicants_count: 4 + index, status: 'published',
  })));

  const applications = Array.from({ length: 90 }, (_, index) => ({
    id: `80000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
    student_id: studentIds[index % studentIds.length],
    job_id: jobs[index % jobs.length].id, company_id: jobs[index % jobs.length].company_id,
    status: ['applied', 'under_review', 'shortlisted', 'interview_scheduled', 'accepted', 'rejected'][index % 6],
    match_score: 64 + (index * 3) % 31, cover_letter: '[بيانات عرض] أرغب بالتقدم لهذه الفرصة لتطوير خبرتي العملية.',
    interview_date: index % 6 === 3 ? future(index + 2) : null, meeting_url: index % 6 === 3 ? 'https://meet.example.invalid/interview' : null,
    applied_at: past(20 - index),
  }));
  await upsert(admin, 'applications', applications);
  await upsert(admin, 'application_status_history', applications.map((application, index) => ({
    id: `81000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
    application_id: application.id, from_status: 'applied', to_status: application.status,
    changed_by: hrId, note: '[بيانات عرض] تحديث حالة التقديم',
  })));
  await upsert(admin, 'saved_jobs', studentIds.flatMap((user_id, index) => [
    { user_id, job_id: jobs[index % jobs.length].id },
    { user_id, job_id: jobs[(index + 3) % jobs.length].id },
  ]), 'user_id,job_id');

  const courses = ID.courses.map((id, index) => ({
    id, trainer_id: trainerId, title: `${['React عملياً', 'SQL لتحليل البيانات', 'أساسيات UX', 'مهارات المقابلة', 'Node.js API', 'إدارة المشاريع'][index % 6]} ${index >= 6 ? 'متقدم' : ''}`.trim(),
    description: '[بيانات عرض] مساق تدريبي كامل لتجربة التسجيل والوحدات والاختبارات والشهادات.',
    category: ['Programming', 'Data', 'Design', 'Career', 'Programming', 'Business'][index % 6],
    level: ['beginner', 'intermediate', 'beginner', 'beginner', 'intermediate', 'beginner'][index % 6],
    duration: `${8 + index * 2} hours`, modules_count: 3, enrolled_count: 8 + index * 3, rating: 4.2 + (index % 4) / 10,
    status: 'published', certificate_enabled: true,
  }));
  await upsert(admin, 'courses', courses);
  const modules = [];
  const lessons = [];
  const quizzes = [];
  courses.forEach((course, courseIndex) => {
    for (let order = 1; order <= 3; order += 1) {
      const moduleId = `90000000-0000-4000-8000-${String(courseIndex * 3 + order).padStart(12, '0')}`;
      modules.push({ id: moduleId, course_id: course.id, title: `الوحدة ${order}`, sort_order: order, lessons_count: 2 });
      for (let lessonOrder = 1; lessonOrder <= 2; lessonOrder += 1) {
        lessons.push({
          id: `91000000-0000-4000-8000-${String((courseIndex * 3 + order - 1) * 2 + lessonOrder).padStart(12, '0')}`,
          module_id: moduleId, title: `درس ${lessonOrder}: تطبيق عملي`, content: '[بيانات عرض] محتوى تدريبي توضيحي.',
          duration_minutes: 15 + lessonOrder * 5, sort_order: lessonOrder,
          video_url: 'https://example.invalid/training-video',
        });
      }
      quizzes.push({
        id: `92000000-0000-4000-8000-${String(courseIndex * 3 + order).padStart(12, '0')}`,
        course_id: course.id, module_id: moduleId, title: `اختبار الوحدة ${order}`,
        pass_score: 60, questions: [{ question: 'سؤال تدريبي', options: ['أ', 'ب', 'ج'], answer: 0 }],
      });
    }
  });
  await upsert(admin, 'course_modules', modules);
  await upsert(admin, 'course_lessons', lessons);
  await upsert(admin, 'course_quizzes', quizzes);
  await upsert(admin, 'course_enrollments', studentIds.flatMap((student_id, index) => [
    { id: `93000000-0000-4000-8000-${String(index * 2 + 1).padStart(12, '0')}`, course_id: courses[index % courses.length].id, student_id, progress: 35 + index * 5 },
    { id: `93000000-0000-4000-8000-${String(index * 2 + 2).padStart(12, '0')}`, course_id: courses[(index + 2) % courses.length].id, student_id, progress: 100 },
  ]));
  await upsert(admin, 'quiz_attempts', studentIds.map((student_id, index) => ({
    id: `94000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
    quiz_id: quizzes[index % quizzes.length].id, student_id, score: 66 + index * 2, answers: [0], passed: true,
  })));
  await upsert(admin, 'certificates_issued', studentIds.slice(0, 24).map((student_id, index) => ({
    id: `95000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
    course_id: courses[index % courses.length].id, student_id, certificate_code: `NAQLA-DEMO-2026-${String(index + 1).padStart(3, '0')}`,
    issued_by: trainerId, qr_payload: `naqla-demo-certificate-${index + 1}`,
  })), 'course_id,student_id');

  await upsert(admin, 'mentor_profiles', [{
    user_id: mentorId, expertise_area: 'التطوير المهني والتوظيف', current_title: 'Career Mentor',
    experience_years: 8, bio: '[بيانات عرض] مرشد مهني لتجربة مسار الإرشاد.', verified: true, rating: 4.8, sessions_count: 24,
  }], 'user_id');
  await upsert(admin, 'mentor_availability', [1, 3, 5].map((day, index) => ({
    id: `96000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`, mentor_id: mentorId,
    day_of_week: day, start_time: '10:00', end_time: '13:00', is_active: true,
  })));
  await upsert(admin, 'mentorship_sessions', studentIds.slice(0, 30).map((mentee_id, index) => ({
    id: `97000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`, mentor_id: mentorId, mentee_id,
    topic: ['تجهيز السيرة الذاتية', 'خطة البحث عن عمل', 'التحضير للمقابلة'][index % 3],
    scheduled_at: index < 3 ? future(index + 2) : past(index + 1), duration_minutes: 45,
    status: index < 3 ? 'accepted' : 'completed', feedback: index > 2 ? 'جلسة مفيدة' : null, rating: index > 2 ? 5 : null,
  })));
  await upsert(admin, 'mentor_notes', studentIds.slice(0, 20).map((mentee_id, index) => ({
    id: `98000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`, mentor_id: mentorId, mentee_id,
    title: 'ملاحظة متابعة', body: '[بيانات عرض] متابعة تقدم المتدرب والخطوة التالية.',
  })));

  const events = ID.events.map((id, index) => ({
    id, organizer_id: trainerId, title: `${['لقاء تعارف المهنيين', 'ورشة بناء CV', 'يوم توظيف تجريبي', 'جلسة تحليل سوق العمل', 'معرض مشاريع'][index % 5]} ${index >= 5 ? `#${index + 1}` : ''}`.trim(),
    description: '[بيانات عرض] فعالية لتجربة التسجيل والإشعارات والحضور.',
    location: ['رام الله', 'نابلس', 'الخليل', 'عبر الإنترنت', 'بيت لحم'][index % 5],
    event_date: future(5 + index * 7), capacity: 60 + index * 20, registered_count: 8 + index * 4, status: 'published',
  }));
  await upsert(admin, 'events', events);
  await upsert(admin, 'event_registrations', studentIds.flatMap((user_id, index) => [
    { id: `99000000-0000-4000-8000-${String(index * 2 + 1).padStart(12, '0')}`, event_id: events[index % events.length].id, user_id, qr_code: `DEMO-${index + 1}-A`, checked_in: index % 2 === 0, checked_in_at: index % 2 === 0 ? past(1) : null },
    { id: `99000000-0000-4000-8000-${String(index * 2 + 2).padStart(12, '0')}`, event_id: events[(index + 2) % events.length].id, user_id, qr_code: `DEMO-${index + 1}-B`, checked_in: false },
  ]));

  const posts = studentIds.slice(0, 30).map((author_id, index) => ({
    id: `a0000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`, author_id,
    content: `[بيانات عرض] ${['أنهيت وحدة React الأولى وأعمل على مشروعي الشخصي.', 'استفدت من جلسة الإرشاد اليوم وحددت خطتي المهنية.', 'سجلت في فعالية قادمة وتحمست للتواصل مع الشركات.', 'أكملت تحديث ملفي المهني.'][index % 4]}`,
    post_type: ['update', 'achievement', 'event', 'article'][index % 4], tags: ['عرض', 'تجربة', 'منصة'], job_id: index % 3 === 0 ? jobs[index].id : null,
    event_id: index % 3 === 2 ? events[index % events.length].id : null, created_at: past(index),
  }));
  await upsert(admin, 'feed_posts', posts);
  await upsert(admin, 'feed_post_likes', posts.flatMap((post, index) => studentIds.slice(0, 3).map((user_id) => ({ post_id: post.id, user_id }))), 'post_id,user_id');
  await upsert(admin, 'feed_post_comments', posts.slice(0, 20).map((post, index) => ({
    id: `a1000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`, post_id: post.id, user_id: studentIds[(index + 2) % studentIds.length],
    content: '[بيانات عرض] أحسنت، استمر في تطوير مهاراتك!',
  })));

  const conversations = studentIds.slice(0, 20).map((studentId, index) => ({
    id: `b0000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`, participant_ids: [studentId, mentorId], last_message_at: past(index),
  }));
  await upsert(admin, 'conversations', conversations);
  await upsert(admin, 'messages', conversations.flatMap((conversation, index) => [
    { id: `b1000000-0000-4000-8000-${String(index * 2 + 1).padStart(12, '0')}`, conversation_id: conversation.id, sender_id: conversation.participant_ids[0], content: '[بيانات عرض] هل يمكن حجز جلسة لمراجعة السيرة الذاتية؟', read: true, created_at: past(index + 1) },
    { id: `b1000000-0000-4000-8000-${String(index * 2 + 2).padStart(12, '0')}`, conversation_id: conversation.id, sender_id: mentorId, content: '[بيانات عرض] بالتأكيد، اختر موعداً مناسباً من صفحة الإرشاد.', read: index % 2 === 0, created_at: past(index) },
  ]));
  await upsert(admin, 'notifications', studentIds.flatMap((user_id, index) => [
    { id: `b2000000-0000-4000-8000-${String(index * 2 + 1).padStart(12, '0')}`, user_id, title: 'تحديث على طلبك', body: '[بيانات عرض] تم نقل طلبك إلى مرحلة المراجعة.', type: 'application', link: '/applications', read: false },
    { id: `b2000000-0000-4000-8000-${String(index * 2 + 2).padStart(12, '0')}`, user_id, title: 'فعالية قادمة', body: '[بيانات عرض] لا تنس حضور الفعالية المسجلة.', type: 'event', link: '/events', read: index % 2 === 0 },
  ]));

  await upsert(admin, 'talent_pools', ID.pools.map((id, index) => ({
    id, company_id: companies[index % companies.length].id, owner_id: hrId, name: `مجموعة مواهب ${index + 1}`,
    description: '[بيانات عرض] مجموعة مرشحين لتجربة مسار المواهب.',
  })));
  await upsert(admin, 'talent_pool_members', ID.pools.flatMap((pool_id, index) => studentIds.slice(index, index + 4).map((user_id) => ({ pool_id, user_id }))), 'pool_id,user_id');

  const internshipRequests = studentIds.slice(0, 30).map((student_id, index) => ({
    id: `c0000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`, student_id, university_id: index % 2 ? 'uni-birzeit' : 'uni-najah',
    company_id: companies[index % companies.length].id, internship_id: ID.internships[index % ID.internships.length], status: ['requested', 'university_approved', 'company_accepted', 'in_progress', 'reports_pending', 'completed'][index % 6],
    start_date: past(30 - index * 2).slice(0, 10), end_date: future(30 + index * 5).slice(0, 10),
  }));
  await upsert(admin, 'internship_requests', internshipRequests);
  await upsert(admin, 'weekly_reports', internshipRequests.map((request, index) => ({
    id: `c1000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`, internship_request_id: request.id, week_number: index + 1,
    title: `الأسبوع ${index + 1}`, tasks_done: '[بيانات عرض] إنجاز مهام التدريب والتعلّم من الفريق.', skills_used: ['Communication', 'Git', 'React'], challenges: 'تنظيم الوقت', status: index % 2 ? 'pending' : 'approved',
  })));
  await upsert(admin, 'internship_evaluations', internshipRequests.flatMap((request, index) => [
    { id: `c2000000-0000-4000-8000-${String(index * 2 + 1).padStart(12, '0')}`, internship_request_id: request.id, evaluator_role: 'company', evaluator_id: hrId, score: 70 + (index * 3) % 30, comments: '[بيانات عرض] تقدم جيد', approved: true },
    { id: `c2000000-0000-4000-8000-${String(index * 2 + 2).padStart(12, '0')}`, internship_request_id: request.id, evaluator_role: 'university', evaluator_id: mentorId, score: 72 + (index * 2) % 27, comments: '[بيانات عرض] متابعة أكاديمية جيدة', approved: true },
  ]));
  await upsert(admin, 'partnerships', Array.from({ length: 24 }, (_, index) => ({
    id: `c3000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
    university_id: index % 2 ? 'uni-birzeit' : 'uni-najah', company_id: companies[index % companies.length].id,
    status: ['active', 'pending', 'active', 'expired'][index % 4], start_date: past(180 - index * 5).slice(0, 10), end_date: future(180 + index * 4).slice(0, 10),
  })));

  const assessments = jobs.slice(0, 20).map((job, index) => ({
    id: `d0000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`, job_id: job.id, title: `تقييم ${job.title}`,
    type: ['mcq', 'coding', 'upload'][index % 3], deadline: future(10 + index), status: 'active',
    description: '[بيانات عرض] تقييم مهني لتجربة التقديم والتقييم.', questions: [{ text: 'سؤال تجريبي', type: 'mcq', options: ['أ', 'ب', 'ج'], correct: 0 }],
  }));
  await upsert(admin, 'assessments', assessments);
  await upsert(admin, 'assessment_submissions', assessments.map((assessment, index) => ({
    id: `d1000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`, assessment_id: assessment.id, application_id: applications[index].id,
    student_id: applications[index].student_id, content: '[بيانات عرض] إجابة التقييم.', score: 70 + (index * 4) % 28,
    feedback: '[بيانات عرض] إجابة جيدة مع نقاط تطوير بسيطة.', status: 'reviewed',
  })));
  await upsert(admin, 'interview_evaluations', applications.slice(0, 20).map((application, index) => ({
    id: `d2000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`, application_id: application.id, evaluator_id: hrId,
    score: 68 + (index * 4) % 30, strengths: 'تواصل واضح ومهارات تقنية جيدة', weaknesses: 'يحتاج مزيداً من الخبرة العملية',
    recommendation: index % 2 ? 'shortlist' : 'proceed', notes: '[بيانات عرض] تقييم مقابلة أولي.',
  })));

  await upsert(admin, 'skills_catalog', [
    ['React', 'technical', 91], ['TypeScript', 'technical', 87], ['Node.js', 'technical', 83], ['SQL', 'technical', 85],
    ['Figma', 'design', 74], ['Power BI', 'data', 77], ['Communication', 'soft', 93], ['Project Management', 'business', 76],
  ].map(([name, category, demand]) => ({ name, category, demand })), 'name');
  await upsert(admin, 'trainer_sessions', [0, 1, 2, 3].map((index) => ({
    id: `e0000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`, trainer_id: trainerId,
    title: ['جلسة React المباشرة', 'ورشة SQL', 'مراجعة مشاريع', 'أسئلة مقابلات'][index],
    scheduled_at: future(index * 4 + 2), attendees: 12 + index * 6, status: index === 3 ? 'completed' : 'scheduled',
    meeting_url: 'https://meet.example.invalid/training',
  })));
  await upsert(admin, 'badges', [
    { code: 'demo_profile_ready', name_ar: 'ملف عرض مكتمل', name_en: 'Demo Profile Ready', description: 'شارة بيانات العرض', icon: 'star' },
    { code: 'demo_course_complete', name_ar: 'متعلم نشط', name_en: 'Active Learner', description: 'أتم مساق عرض', icon: 'book' },
  ], 'code');
  const { data: badgeRows, error: badgeError } = await admin.from('badges').select('id,code').in('code', ['demo_profile_ready', 'demo_course_complete']);
  if (badgeError) throw badgeError;
  await upsert(admin, 'user_badges', studentIds.slice(0, 6).flatMap((user_id, index) => badgeRows.map((badge) => ({ user_id, badge_id: badge.id }))), 'user_id,badge_id');

  await upsert(admin, 'company_follows', studentIds.slice(0, 30).map((user_id, index) => ({ user_id, company_id: companies[index % companies.length].id })), 'user_id,company_id');
  await upsert(admin, 'content_reports', posts.slice(0, 3).map((post, index) => ({
    id: `f0000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`, reporter_id: studentIds[index], target_type: 'post',
    target_id: post.id, target_label: 'منشور عرض', reason: 'اختبار مسار الإشراف', status: index === 0 ? 'pending' : 'reviewed', link: '/feed',
  })));
  await upsert(admin, 'platform_settings', [
    { key: 'demo_dataset', value: { enabled: true, generatedAt: new Date().toISOString(), purpose: 'committee-demo' }, updated_by: hrId },
    { key: 'security_policies', value: { twoFactor: true, logIp: true, rateLimit: true, encryption: true }, updated_by: hrId },
  ], 'key');
  await upsert(admin, 'cv_files', studentIds.slice(0, 20).map((user_id, index) => ({
    id: `f1000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`, user_id, file_name: `demo-cv-${index + 1}.pdf`,
    storage_path: `demo/cv-${index + 1}.pdf`, public_url: null, extracted_chars: 1200 + index * 90,
  })));
  await upsert(admin, 'audit_logs', [
    { id: 'f2000000-0000-4000-8000-000000000001', actor_id: hrId, action: 'demo_dataset_seeded', entity_type: 'dataset', entity_id: 'committee-demo', metadata: { source: 'Supabase seeder' } },
  ]);

  console.log(`Demo database seeded: ${PEOPLE.length} accounts, ${companies.length} companies, ${jobs.length} jobs, ${courses.length} courses, ${events.length} events and linked records across all operational tables.`);
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exitCode = 1;
});
