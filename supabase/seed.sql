-- Naqlah demo seed — run AFTER 001–004
-- Catalog data only (no auth.users). Register users from /auth/register.

insert into public.companies (id, name, industry, description, logo_url, location, size, verified)
values
  ('a1111111-1111-1111-1111-111111111111', 'Asal Technologies', 'Technology',
   'شركة فلسطينية رائدة في تطوير البرمجيات والتدريب التقني.',
   'https://api.dicebear.com/7.x/initials/svg?seed=Asal', 'رام الله', '201-500', true),
  ('a2222222-2222-2222-2222-222222222222', 'Bank of Palestine', 'Finance',
   'فرص تدريب وتوظيف في القطاع المصرفي الفلسطيني.',
   'https://api.dicebear.com/7.x/initials/svg?seed=BOP', 'رام الله', '1000+', true),
  ('a3333333-3333-3333-3333-333333333333', 'Jawwal', 'Telecom',
   'اتصالات وحلول رقمية لخريجي الجامعات الفلسطينية.',
   'https://api.dicebear.com/7.x/initials/svg?seed=Jawwal', 'رام الله', '1000+', true)
on conflict (id) do nothing;

insert into public.jobs (id, company_id, title, description, requirements, skills, salary_min, salary_max, currency, location, work_type, experience_level, status)
values
  ('b1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111',
   'Frontend Developer', 'بناء واجهات ويب حديثة بـ React و TypeScript.',
   array['React', 'TypeScript', 'Git'], array['React','TypeScript','CSS','Next.js'],
   2500, 4000, 'USD', 'رام الله', 'hybrid', 'junior', 'published'),
  ('b2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222',
   'Business Analyst', 'تحليل متطلبات الأنظمة المصرفية ودعم التحول الرقمي.',
   array['SQL', 'Communication'], array['SQL','Excel','Analysis','Communication'],
   2000, 3500, 'USD', 'رام الله', 'on-site', 'entry', 'published'),
  ('b3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333',
   'Mobile Developer', 'تطوير تطبيقات الموبايل لنظام Jawwal الرقمي.',
   array['React Native', 'APIs'], array['React Native','JavaScript','REST'],
   2800, 4500, 'USD', 'رام الله', 'remote', 'mid', 'published')
on conflict (id) do nothing;

insert into public.internships (id, company_id, title, description, requirements, duration, paid, salary, location, work_type, status)
values
  ('c1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111',
   'Software Engineering Intern', 'تدريب عملي مع فرق التطوير.',
   array['Programming basics'], '3 months', true, 500, 'رام الله', 'hybrid', 'published'),
  ('c2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222',
   'Finance Intern', 'تدريب في العمليات المصرفية وتحليل البيانات.',
   array['Excel'], '4 months', true, 400, 'نابلس', 'on-site', 'published')
on conflict (id) do nothing;

insert into public.courses (id, title, description, category, level, duration, modules_count, enrolled_count, rating, status)
values
  ('d1111111-1111-1111-1111-111111111111', 'React للمبتدئين', 'أساسيات بناء واجهات تفاعلية.',
   'Web', 'beginner', '20 hours', 8, 42, 4.6, 'published'),
  ('d2222222-2222-2222-2222-222222222222', 'تحليل البيانات للأعمال', 'Excel و SQL لاتخاذ القرار.',
   'Data', 'beginner', '16 hours', 6, 28, 4.4, 'published')
on conflict (id) do nothing;

insert into public.events (id, title, description, location, event_date, capacity, registered_count, status)
values
  ('e1111111-1111-1111-1111-111111111111',
   'يوم مهني — جامعة النجاح', 'لقاءات مع شركات فلسطينية وفرص تدريب.',
   'نابلس — حرم الجامعة', now() + interval '14 days', 300, 48, 'published'),
  ('e2222222-2222-2222-2222-222222222222',
   'ورشة مطابقة المهارات', 'كيف تجهّز ملفك وCV لسوق العمل.',
   'رام الله', now() + interval '21 days', 80, 22, 'published')
on conflict (id) do nothing;

insert into public.partnerships (id, university_id, company_id, status, start_date)
values
  ('f1111111-1111-1111-1111-111111111111', 'an-najah', 'a1111111-1111-1111-1111-111111111111', 'active', current_date - 90),
  ('f2222222-2222-2222-2222-222222222222', 'an-najah', 'a2222222-2222-2222-2222-222222222222', 'active', current_date - 60)
on conflict (id) do nothing;

insert into public.assessments (id, job_id, title, type, deadline, status)
values
  ('aa111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111',
   'React Basics Screening', 'mcq', now() + interval '10 days', 'active'),
  ('aa222222-2222-2222-2222-222222222222', 'b3333333-3333-3333-3333-333333333333',
   'Mobile Coding Task', 'coding', now() + interval '12 days', 'active')
on conflict (id) do nothing;

insert into public.talent_pools (id, company_id, owner_id, name, description)
values
  ('ab111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', null,
   'خريجو هندسة برمجيات 2026', 'مرشحون واعدون لفرص Frontend و Full-stack'),
  ('ab222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', null,
   'تحليل أعمال', 'طلاب بتخصصات نظم معلومات وإدارة')
on conflict (id) do nothing;
