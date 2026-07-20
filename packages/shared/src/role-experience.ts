import type { UserRole } from './types';

export interface RoleScenario {
  title: string;
  description: string;
  cta: string;
  webHref: string;
  mobileRoute: string;
}

export interface RoleExperienceBase {
  id: UserRole;
  label: string;
  tagline: string;
  mantra: string;
  icon: string;
  accentKey: 'blue' | 'emerald' | 'purple' | 'amber' | 'cyan' | 'violet' | 'pink' | 'red';
  primaryFocus: string[];
  scenarios: RoleScenario[];
  emptyStates: Record<string, { title: string; description: string }>;
}

export const ROLE_EXPERIENCE_BASE: Record<UserRole, RoleExperienceBase> = {
  student: {
    id: 'student',
    label: 'طالب',
    tagline: 'من الجامعة إلى أول فرصة',
    mantra: 'كل خطوة تبني هويتك المهنية',
    icon: '🎓',
    accentKey: 'blue',
    primaryFocus: ['اكتمال الملف', 'فرص مناسبة', 'مهارات ناقصة', 'كورسات مقترحة'],
    scenarios: [
      {
        title: 'أول تقديم',
        description: 'قدّم على تدريب يناسب تخصصك ومهاراتك',
        cta: 'استكشف التدريب',
        webHref: '/internships',
        mobileRoute: '/internships',
      },
      {
        title: 'سدّ الفجوة',
        description: 'اكتشف المهارات الناقصة وخطة التعلم',
        cta: 'تحليل المسار',
        webHref: '/ai/career-path',
        mobileRoute: '/(tabs)/ai',
      },
      {
        title: 'جلسة إرشاد',
        description: 'احجز مع مرشد مهني قبل أول مقابلة',
        cta: 'احجز جلسة',
        webHref: '/mentorship',
        mobileRoute: '/mentorship',
      },
    ],
    emptyStates: {
      applications: { title: 'لم تتقدّم بعد', description: 'ابدأ بأول فرصة — التدريب أو المشروع يفتح الباب' },
      jobs: { title: 'لا توجد فرص محفوظة', description: 'احفظ الفرص المناسبة وراجعها لاحقاً' },
    },
  },
  graduate: {
    id: 'graduate',
    label: 'خريج',
    tagline: 'من التخرج إلى أول وظيفة',
    mantra: 'خبرتك تستحق أن تُروى بشكل احترافي',
    icon: '🚀',
    accentKey: 'emerald',
    primaryFocus: ['حالة التوظيف', 'طلبات نشطة', 'مقابلات', 'شبكة خريجين'],
    scenarios: [
      {
        title: 'تحديث الحالة',
        description: 'أخبر جامعتك إذا تم توظيفك — يهم الخريجين القادمين',
        cta: 'حدّث حالتك',
        webHref: '/dashboard/graduate',
        mobileRoute: '/dashboard/graduate',
      },
      {
        title: 'مراجعة CV',
        description: 'حلّل سيرتك قبل كل تقديم مهم',
        cta: 'حلّل السيرة',
        webHref: '/ai/cv-analyzer',
        mobileRoute: '/(tabs)/ai',
      },
      {
        title: 'مجتمع الخريجين',
        description: 'تواصل مع خريجين في مجالك',
        cta: 'انضم للمجتمع',
        webHref: '/community',
        mobileRoute: '/journey',
      },
    ],
    emptyStates: {
      applications: { title: 'ابدأ رحلة التوظيف', description: 'الخريج الناجح يقدّم بذكاء — ليس عشوائياً' },
    },
  },
  company: {
    id: 'company',
    label: 'شركة',
    tagline: 'ابنِ فريقك من المواهب الفلسطينية',
    mantra: 'المرشح المناسب أقرب مما تتوقع',
    icon: '🏢',
    accentKey: 'purple',
    primaryFocus: ['فرص منشورة', 'متقدمين جدد', 'مقابلات', 'معدل القبول'],
    scenarios: [
      {
        title: 'نشر فرصة',
        description: 'وظيفة أو تدريب — النظام يوصي بمرشحين تلقائياً',
        cta: 'انشر الآن',
        webHref: '/dashboard/company/jobs',
        mobileRoute: '/dashboard/company',
      },
      {
        title: 'مراجعة سريعة',
        description: 'راجع المتقدمين ورتّبهم حسب التطابق',
        cta: 'المتقدمين',
        webHref: '/dashboard/company/applications',
        mobileRoute: '/dashboard/company',
      },
      {
        title: 'شراكة جامعية',
        description: 'اربط شركتك بجامعة للوصول لطلاب مؤهلين',
        cta: 'طلب شراكة',
        webHref: '/dashboard/company/partnerships',
        mobileRoute: '/dashboard/company',
      },
    ],
    emptyStates: {
      applicants: { title: 'لا متقدمين بعد', description: 'انشر فرصتك الأولى أو حسّن وصف المهارات المطلوبة' },
    },
  },
  hr: {
    id: 'hr',
    label: 'موارد بشرية',
    tagline: 'قمع التوظيف في لمحة واحدة',
    mantra: 'قرار سريع — مرشح مناسب',
    icon: '⚡',
    accentKey: 'amber',
    primaryFocus: ['معلّق للمراجعة', 'مقابلات اليوم', 'اختبارات', 'قرارات'],
    scenarios: [
      {
        title: 'مراجعة صباحية',
        description: '15 دقيقة لترتيب المتقدمين الجدد',
        cta: 'ابدأ المراجعة',
        webHref: '/dashboard/hr/candidates',
        mobileRoute: '/dashboard/hr',
      },
      {
        title: 'جدولة مقابلة',
        description: 'أرسل دعوة بضغطة مع رابط الاجتماع',
        cta: 'جدول مقابلة',
        webHref: '/dashboard/hr/interviews',
        mobileRoute: '/dashboard/hr',
      },
      {
        title: 'اختبار تقني',
        description: 'أرسل task للمرشحين في القائمة المختصرة',
        cta: 'إنشاء اختبار',
        webHref: '/dashboard/hr/assessments',
        mobileRoute: '/dashboard/hr',
      },
    ],
    emptyStates: {
      pipeline: { title: 'القمع فارغ', description: 'ستظهر البطاقات هنا عند وصول أول متقدم' },
    },
  },
  university: {
    id: 'university',
    label: 'جامعة',
    tagline: 'رؤية شاملة لطلابك وخريجيك',
    mantra: 'بيانات دقيقة — قرارات أكاديمية ذكية',
    icon: '🎓',
    accentKey: 'cyan',
    primaryFocus: ['طلاب نشطون', 'تدريبات', 'فجوات مهارية', 'نسبة التوظيف'],
    scenarios: [
      {
        title: 'اعتماد تدريب',
        description: 'وافق على طلب تدريب طالب في شركة شريكة',
        cta: 'الطلبات المعلقة',
        webHref: '/dashboard/university/internships',
        mobileRoute: '/dashboard/university',
      },
      {
        title: 'يوم مهني',
        description: 'نظّم فعالية واربط الطلاب بالشركات',
        cta: 'إنشاء فعالية',
        webHref: '/dashboard/university/events',
        mobileRoute: '/events',
      },
      {
        title: 'تقرير التخصص',
        description: 'شاهد أين يعمل خريجو كل تخصص',
        cta: 'التقارير',
        webHref: '/dashboard/university/reports',
        mobileRoute: '/dashboard/university',
      },
    ],
    emptyStates: {
      internships: { title: 'لا طلبات تدريب', description: 'شجّع الطلاب على التقديم عبر الشراكات النشطة' },
    },
  },
  trainer: {
    id: 'trainer',
    label: 'مدرب',
    tagline: 'علّم ما يحتاجه السوق اليوم',
    mantra: 'كورسك قد يكون نقلة لحياة طالب',
    icon: '📚',
    accentKey: 'violet',
    primaryFocus: ['كورسات نشطة', 'طلاب مسجلون', 'واجبات معلقة', 'تقييم'],
    scenarios: [
      {
        title: 'كورس جديد',
        description: 'ابنِ مساراً من الدروس والاختبارات والشهادة',
        cta: 'أنشئ كورس',
        webHref: '/dashboard/trainer/courses',
        mobileRoute: '/dashboard/trainer',
      },
      {
        title: 'تصحيح سريع',
        description: 'راجع الواجبات المعلقة من الموبايل',
        cta: 'الواجبات',
        webHref: '/dashboard/trainer/students',
        mobileRoute: '/dashboard/trainer',
      },
      {
        title: 'جلسة مباشرة',
        description: 'جدول live session مع طلابك',
        cta: 'جدولة',
        webHref: '/dashboard/trainer/sessions',
        mobileRoute: '/dashboard/trainer',
      },
    ],
    emptyStates: {
      courses: { title: 'لا كورسات بعد', description: 'أول كورسك يمكن أن يُربط بفرص تدريب في الشركات' },
    },
  },
  mentor: {
    id: 'mentor',
    label: 'مرشد مهني',
    tagline: 'أرشد الجيل القادم بخبرتك',
    mantra: 'جلسة واحدة قد تغيّر مساراً كاملاً',
    icon: '🤝',
    accentKey: 'pink',
    primaryFocus: ['طلبات جديدة', 'جلسات قادمة', 'تقييم', 'ملاحظات'],
    scenarios: [
      {
        title: 'طلب جلسة',
        description: 'اقبل أو ارفض — الطالب ينتظر ردك',
        cta: 'الطلبات',
        webHref: '/dashboard/mentor/requests',
        mobileRoute: '/dashboard/mentor',
      },
      {
        title: 'بعد الجلسة',
        description: 'اكتب feedback و action items واضحة',
        cta: 'ملاحظات',
        webHref: '/dashboard/mentor/notes',
        mobileRoute: '/dashboard/mentor',
      },
      {
        title: 'أوقاتك',
        description: 'حدّث availability ليتمكن الطلاب من الحجز',
        cta: 'التقويم',
        webHref: '/dashboard/mentor/availability',
        mobileRoute: '/dashboard/mentor',
      },
    ],
    emptyStates: {
      sessions: { title: 'لا جلسات مجدولة', description: 'حدّث أوقاتك المتاحة لاستقبال طلبات جديدة' },
    },
  },
  admin: {
    id: 'admin',
    label: 'إدارة النظام',
    tagline: 'النظام البيئي كاملاً في يدك',
    mantra: 'جودة المنصة تبدأ من هنا',
    icon: '🛡️',
    accentKey: 'red',
    primaryFocus: ['موافقات معلقة', 'بلاغات', 'نمو المنصة', 'صحة النظام'],
    scenarios: [
      {
        title: 'موافقة شركة',
        description: 'تحقق من الوثائق قبل تفعيل نشر الفرص',
        cta: 'قائمة الانتظار',
        webHref: '/dashboard/admin/verification',
        mobileRoute: '/dashboard/admin',
      },
      {
        title: 'إشراف محتوى',
        description: 'راجع البلاغات واتخذ إجراء',
        cta: 'البلاغات',
        webHref: '/dashboard/admin/moderation',
        mobileRoute: '/dashboard/admin',
      },
      {
        title: 'تحليل النمو',
        description: 'شاهد اتجاهات المستخدمين والوظائف',
        cta: 'التقارير',
        webHref: '/dashboard/admin/reports',
        mobileRoute: '/dashboard/admin',
      },
    ],
    emptyStates: {
      verification: { title: 'لا موافقات معلقة', description: 'كل الحسابات الجديدة تمت مراجعتها' },
    },
  },
};

export function getRoleExperienceBase(role: UserRole): RoleExperienceBase {
  return ROLE_EXPERIENCE_BASE[role] ?? ROLE_EXPERIENCE_BASE.student;
}
