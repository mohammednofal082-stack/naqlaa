import type { InterviewQuestion } from '../types';

const QUESTION_BANK: Record<string, InterviewQuestion[]> = {
  frontend: [
    { id: 'fe-1', question: 'اشرح مفهوم React Virtual DOM ولماذا يُستخدم', type: 'technical' },
    { id: 'fe-2', question: 'ما الفرق بين useState و useRef؟ متى تستخدم كل واحد؟', type: 'technical' },
    { id: 'fe-3', question: 'كيف تحسّن أداء تطبيق React كبير؟', type: 'technical' },
    { id: 'fe-4', question: 'حدثني عن نفسك ولماذا تريد هذه الوظيفة؟', type: 'hr' },
    { id: 'fe-5', question: 'صف موقفاً واجهت فيه تحدي تقني وحللته', type: 'behavioral' },
  ],
  fullstack: [
    { id: 'fs-1', question: 'كيف تصمم REST API آمن وقابل للتوسع؟', type: 'technical' },
    { id: 'fs-2', question: 'اشرح الفرق بين SQL و NoSQL ومتى تختار كل واحد', type: 'technical' },
    { id: 'fs-3', question: 'كيف تتعامل مع المصادقة في تطبيق Full Stack؟', type: 'technical' },
    { id: 'fs-4', question: 'ما أكبر مشروع بنيته من الصفر؟', type: 'hr' },
    { id: 'fs-5', question: 'كيف تتعامل مع ضغط المواعيد النهائية؟', type: 'behavioral' },
  ],
  default: [
    { id: 'd-1', question: 'ما أهم مهارة تعلمتها مؤخراً وكيف طبقتها؟', type: 'technical' },
    { id: 'd-2', question: 'لماذا تريد الانضمام لفريقنا؟', type: 'hr' },
    { id: 'd-3', question: 'صف تعاوناً ناجحاً مع فريق متعدد التخصصات', type: 'behavioral' },
    { id: 'd-4', question: 'كيف تتعلم تقنيات جديدة بسرعة؟', type: 'technical' },
  ],
};

function resolveBank(jobTitle: string): InterviewQuestion[] {
  const t = jobTitle.toLowerCase();
  if (t.includes('front') || t.includes('واجه') || t.includes('react')) return QUESTION_BANK.frontend;
  if (t.includes('full') || t.includes('stack') || t.includes('نود')) return QUESTION_BANK.fullstack;
  return QUESTION_BANK.default;
}

export function startInterviewQuestions(jobTitle: string, level: 'junior' | 'mid' | 'senior' = 'mid') {
  const bank = resolveBank(jobTitle);
  const count = level === 'junior' ? 3 : level === 'senior' ? 5 : 4;
  return bank.slice(0, count).map((q) => ({
    ...q,
    question: q.question.replace('Frontend', jobTitle),
  }));
}

const TECH_KEYWORDS = ['react', 'api', 'dom', 'state', 'hook', 'sql', 'docker', 'component', 'ريأكت', 'واجهة'];
const STAR_KEYWORDS = ['مثال', 'تجربة', 'نتيجة', 'حللت', 'فريق', 'مشروع', 'تحسين', '%'];

export function evaluateInterviewAnswer(input: {
  question: string;
  answer: string;
  type: 'technical' | 'hr' | 'behavioral';
  jobTitle: string;
}) {
  const answer = input.answer.trim();
  const len = answer.length;
  let score = 35;

  if (len > 40) score += 12;
  if (len > 120) score += 10;
  if (len > 250) score += 8;

  const lower = answer.toLowerCase();
  const techHits = TECH_KEYWORDS.filter((k) => lower.includes(k)).length;
  score += Math.min(15, techHits * 4);

  if (STAR_KEYWORDS.some((k) => answer.includes(k))) score += 12;

  if (input.type === 'technical' && techHits === 0) score -= 8;
  if (input.type === 'behavioral' && !STAR_KEYWORDS.some((k) => answer.includes(k))) score -= 5;

  score = Math.min(95, Math.max(25, score));

  const feedback =
    score >= 80
      ? 'إجابة قوية — واضحة ومربوطة بالسياق المهني.'
      : score >= 60
        ? 'إجابة جيدة — أضف أمثلة عملية وأرقاماً إن أمكن.'
        : 'إجابة أولية — وسّع الشرح واستخدم بنية الموقف → الإجراء → النتيجة.';

  return {
    score,
    feedback,
    tips: [
      'اربط إجابتك بمتطلبات الوظيفة المستهدفة',
      'استخدم أمثلة من مشاريعك أو تدريبك',
      input.type === 'technical' ? 'اذكر مفاهيم تقنية محددة' : 'أظهر مهارات التواصل والعمل الجماعي',
    ],
  };
}
