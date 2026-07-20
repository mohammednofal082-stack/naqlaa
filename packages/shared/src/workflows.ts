export interface WorkflowStep {
  label: string;
  actor: string;
}

export interface PlatformWorkflow {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  duration: string;
  roles: string[];
  steps: WorkflowStep[];
  outcome: string;
  webDemo: string;
  mobileDemo: string;
}

type TFn = (ar: string, en: string) => string;
const identity: TFn = (ar) => ar;

export function buildPlatformWorkflows(t: TFn = identity): PlatformWorkflow[] {
  return [
    {
      id: 'onboarding',
      title: t('انضمام الطالب', 'Student Onboarding'),
      subtitle: t('من التسجيل إلى حساب skill gap و profile completion', 'From registration to skill-gap analysis and profile completion'),
      icon: '🎓',
      color: '#2563EB',
      duration: t('15 دقيقة', '15 minutes'),
      roles: [t('طالب', 'Student'), t('جامعة', 'University')],
      steps: [
        { label: t('تسجيل حساب طالب', 'Create a student account'), actor: t('طالب', 'Student') },
        { label: t('اختيار الجامعة والتخصص', 'Choose university and major'), actor: t('طالب', 'Student') },
        { label: t('تأكيد البريد', 'Confirm email'), actor: t('نظام', 'System') },
        { label: t('بناء الملف — مهارات ومشاريع', 'Build profile — skills and projects'), actor: t('طالب', 'Student') },
        { label: t('رفع السيرة الذاتية', 'Upload CV'), actor: t('طالب', 'Student') },
        { label: t('حساب فجوة المهارات واكتمال الملف', 'Skill-gap analysis and profile completion'), actor: t('نقلة', 'Naqla') },
      ],
      outcome: t('ملف مهني جاهز مع توصيات تعلم مخصصة', 'A ready professional profile with tailored learning recommendations'),
      webDemo: '/profile/edit',
      mobileDemo: '/(tabs)/profile',
    },
    {
      id: 'application',
      title: t('التقديم على فرصة', 'Applying to an Opportunity'),
      subtitle: t('من نشر الشركة إلى قرار HR النهائي', 'From company posting to the final HR decision'),
      icon: '💼',
      color: '#14B8A6',
      duration: t('7–14 يوم', '7–14 days'),
      roles: [t('شركة', 'Company'), t('طالب', 'Student'), 'HR'],
      steps: [
        { label: t('الشركة تنشر وظيفة أو تدريب', 'Company posts a job or internship'), actor: t('شركة', 'Company') },
        { label: t('النظام يحسب نسبة التطابق', 'System computes the match score'), actor: t('نقلة', 'Naqla') },
        { label: t('الطالب يقدّم باستخدام السيرة الذاتية', 'Student applies with a CV'), actor: t('طالب', 'Student') },
        { label: t('HR يراجع الطلب', 'HR reviews the application'), actor: 'HR' },
        { label: t('قائمة مختصرة أو رفض', 'Shortlist or reject'), actor: 'HR' },
        { label: t('اختبار/مقابلة', 'Assessment / interview'), actor: t('HR + طالب', 'HR + Student') },
        { label: t('قرار نهائي + إشعار', 'Final decision + notification'), actor: t('نظام', 'System') },
      ],
      outcome: t('توظيف أو تدريب مع تتبع كامل للحالة', 'A hire or internship with full status tracking'),
      webDemo: '/applications',
      mobileDemo: '/(tabs)/applications',
    },
    {
      id: 'internship',
      title: t('تتبع التدريب العملي', 'Practical Internship Tracking'),
      subtitle: t('اعتماد جامعي + تقارير أسبوعية + تقييم شركة', 'University approval + weekly reports + company evaluation'),
      icon: '📋',
      color: '#06B6D4',
      duration: t('3–6 أشهر', '3–6 months'),
      roles: [t('طالب', 'Student'), t('جامعة', 'University'), t('شركة', 'Company')],
      steps: [
        { label: t('طلب اعتماد تدريب', 'Request internship approval'), actor: t('طالب', 'Student') },
        { label: t('مراجعة الجامعة', 'University review'), actor: t('جامعة', 'University') },
        { label: t('تأكيد الشركة', 'Company confirmation'), actor: t('شركة', 'Company') },
        { label: t('تقارير أسبوعية', 'Weekly reports'), actor: t('طالب', 'Student') },
        { label: t('تقييم الشركة', 'Company evaluation'), actor: t('شركة', 'Company') },
        { label: t('مراجعة المشرف الجامعي', 'Academic supervisor review'), actor: t('جامعة', 'University') },
        { label: t('اعتماد التدريب', 'Internship accreditation'), actor: t('جامعة', 'University') },
      ],
      outcome: t('تدريب موثّق رسمياً في سجل الطالب', 'An officially documented internship in the student record'),
      webDemo: '/dashboard/university/internships',
      mobileDemo: '/internships',
    },
    {
      id: 'course',
      title: t('إكمال كورس', 'Completing a Course'),
      subtitle: t('من إنشاء المدرب إلى شهادة ومهارة في البروفايل', 'From trainer creation to a certificate and a profile skill'),
      icon: '📚',
      color: '#8B5CF6',
      duration: t('4–8 أسابيع', '4–8 weeks'),
      roles: [t('مدرب', 'Trainer'), t('طالب', 'Student')],
      steps: [
        { label: t('المدرب ينشر كورس', 'Trainer publishes a course'), actor: t('مدرب', 'Trainer') },
        { label: t('الطالب يسجّل', 'Student enrolls'), actor: t('طالب', 'Student') },
        { label: t('متابعة الدروس', 'Follow the lessons'), actor: t('طالب', 'Student') },
        { label: t('حل اختبار/تكليف', 'Complete quiz / assignment'), actor: t('طالب', 'Student') },
        { label: t('تقييم المدرب', 'Trainer grading'), actor: t('مدرب', 'Trainer') },
        { label: t('إصدار شهادة', 'Issue certificate'), actor: t('نظام', 'System') },
        { label: t('إضافة مهارة للبروفايل', 'Add skill to profile'), actor: t('نظام', 'System') },
      ],
      outcome: t('مهارة موثّقة + شهادة قابلة للمشاركة', 'A verified skill + a shareable certificate'),
      webDemo: '/courses',
      mobileDemo: '/courses',
    },
    {
      id: 'mentorship',
      title: t('جلسة إرشاد', 'Mentorship Session'),
      subtitle: t('حجز → جلسة → feedback → تقييم', 'Booking → session → feedback → rating'),
      icon: '🤝',
      color: '#EC4899',
      duration: t('45–60 دقيقة', '45–60 minutes'),
      roles: [t('طالب', 'Student'), t('مرشد', 'Mentor')],
      steps: [
        { label: t('البحث عن مرشد', 'Search for a mentor'), actor: t('طالب', 'Student') },
        { label: t('اختيار موعد متاح', 'Pick an available slot'), actor: t('طالب', 'Student') },
        { label: t('إرسال طلب', 'Send a request'), actor: t('طالب', 'Student') },
        { label: t('قبول المرشد', 'Mentor accepts'), actor: t('مرشد', 'Mentor') },
        { label: t('إجراء الجلسة', 'Hold the session'), actor: t('طالب + مرشد', 'Student + Mentor') },
        { label: t('كتابة الملاحظات', 'Write feedback'), actor: t('مرشد', 'Mentor') },
        { label: t('تقييم الجلسة', 'Rate the session'), actor: t('طالب', 'Student') },
      ],
      outcome: t('خطة عمل واضحة للطالب', 'A clear action plan for the student'),
      webDemo: '/mentorship',
      mobileDemo: '/mentorship',
    },
    {
      id: 'event',
      title: t('حضور فعالية', 'Attending an Event'),
      subtitle: t('تسجيل → QR → check-in → شهادة', 'Registration → QR → check-in → certificate'),
      icon: '🎪',
      color: '#F59E0B',
      duration: t('يوم واحد', 'One day'),
      roles: [t('جامعة', 'University'), t('شركة', 'Company'), t('طالب', 'Student')],
      steps: [
        { label: t('نشر فعالية', 'Publish an event'), actor: t('جامعة/شركة', 'University / Company') },
        { label: t('تسجيل الطالب', 'Student registration'), actor: t('طالب', 'Student') },
        { label: t('استلام رمز QR', 'Receive QR code'), actor: t('نظام', 'System') },
        { label: t('تسجيل الحضور يوم الحدث', 'Check-in on event day'), actor: t('طالب', 'Student') },
        { label: t('حفظ الحضور', 'Record attendance'), actor: t('نظام', 'System') },
        { label: t('شهادة/شارة اختيارية', 'Optional certificate / badge'), actor: t('نظام', 'System') },
      ],
      outcome: t('حضور موثّق + فرص تواصل', 'Documented attendance + networking opportunities'),
      webDemo: '/events',
      mobileDemo: '/events',
    },
    {
      id: 'verification',
      title: t('اعتماد Admin', 'Admin Verification'),
      subtitle: t('تحقق من الشركات والمدربين والمرشدين', 'Verifying companies, trainers, and mentors'),
      icon: '🛡️',
      color: '#EF4444',
      duration: t('24–48 ساعة', '24–48 hours'),
      roles: [t('شركة', 'Company'), t('مدرب', 'Trainer'), t('مرشد', 'Mentor'), 'Admin'],
      steps: [
        { label: t('تسجيل حساب جديد', 'Register a new account'), actor: t('شركة/مدرب/مرشد', 'Company / Trainer / Mentor') },
        { label: t('رفع بيانات ووثائق', 'Upload details and documents'), actor: t('مستخدم', 'User') },
        { label: t('مراجعة Admin', 'Admin review'), actor: 'Admin' },
        { label: t('موافقة / رفض / يحتاج معلومات', 'Approve / Reject / Needs Info'), actor: 'Admin' },
        { label: t('تفعيل الصلاحيات', 'Enable permissions'), actor: t('نظام', 'System') },
      ],
      outcome: t('منصة آمنة بجودة محتوى عالية', 'A secure platform with high content quality'),
      webDemo: '/dashboard/admin/verification',
      mobileDemo: '/dashboard/admin',
    },
  ];
}

export const PLATFORM_WORKFLOWS: PlatformWorkflow[] = buildPlatformWorkflows();
