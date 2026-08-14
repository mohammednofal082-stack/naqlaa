import type {
  BillingOverview,
  BillingPlan,
  FeeCatalogItem,
  Invoice,
  Subscription,
} from '../types';

export const billingPlans: BillingPlan[] = [
  {
    id: 'free',
    nameAr: 'مجاني',
    nameEn: 'Free',
    priceMonthly: 0,
    currency: 'USD',
    featuresAr: ['نشر وظيفة واحدة / شهر', 'بحث أساسي عن المرشحين', 'دعم المجتمع'],
    featuresEn: ['1 job post / month', 'Basic candidate search', 'Community support'],
  },
  {
    id: 'starter',
    nameAr: 'Starter',
    nameEn: 'Starter',
    priceMonthly: 49,
    currency: 'USD',
    featuresAr: ['5 وظائف / شهر', 'Talent Pools', 'تقارير توظيف أساسية'],
    featuresEn: ['5 jobs / month', 'Talent Pools', 'Basic hiring reports'],
  },
  {
    id: 'growth',
    nameAr: 'Growth',
    nameEn: 'Growth',
    priceMonthly: 149,
    currency: 'USD',
    recommended: true,
    featuresAr: ['وظائف غير محدودة', 'تمييز الإعلانات', 'تحليلات متقدمة', 'دعم أولوية'],
    featuresEn: ['Unlimited jobs', 'Featured listings', 'Advanced analytics', 'Priority support'],
  },
  {
    id: 'enterprise',
    nameAr: 'Enterprise',
    nameEn: 'Enterprise',
    priceMonthly: 399,
    currency: 'USD',
    featuresAr: ['شراكات جامعية', 'SSO', 'مدير حساب', 'فواتير مخصّصة'],
    featuresEn: ['University partnerships', 'SSO', 'Account manager', 'Custom invoices'],
  },
];

export const feeCatalog: FeeCatalogItem[] = [
  {
    id: 'fee-job',
    kind: 'job_posting',
    nameAr: 'نشر وظيفة إضافية',
    nameEn: 'Extra job posting',
    amount: 25,
    currency: 'USD',
    unitAr: 'لكل وظيفة',
    unitEn: 'per job',
  },
  {
    id: 'fee-featured',
    kind: 'featured',
    nameAr: 'تمييز إعلان',
    nameEn: 'Featured listing',
    amount: 40,
    currency: 'USD',
    unitAr: 'لمدة 7 أيام',
    unitEn: 'for 7 days',
  },
  {
    id: 'fee-course',
    kind: 'course',
    nameAr: 'رسوم كورس مهني',
    nameEn: 'Professional course fee',
    amount: 35,
    currency: 'USD',
    unitAr: 'لكل كورس',
    unitEn: 'per course',
  },
  {
    id: 'fee-cert',
    kind: 'certification',
    nameAr: 'إصدار شهادة',
    nameEn: 'Certificate issuance',
    amount: 15,
    currency: 'USD',
    unitAr: 'لكل شهادة',
    unitEn: 'per certificate',
  },
  {
    id: 'fee-partner',
    kind: 'partnership',
    nameAr: 'رسوم شراكة جامعية',
    nameEn: 'University partnership fee',
    amount: 200,
    currency: 'USD',
    unitAr: 'سنوياً',
    unitEn: 'yearly',
  },
];

const baseInvoices: Invoice[] = [
  {
    id: 'inv-1001',
    number: 'NQ-2026-1001',
    accountType: 'company',
    accountId: 'comp-1',
    accountName: 'Jawwal',
    status: 'paid',
    issuedAt: '2026-05-01',
    dueAt: '2026-05-15',
    paidAt: '2026-05-03',
    currency: 'USD',
    subtotal: 149,
    tax: 0,
    total: 149,
    lines: [
      {
        descriptionAr: 'اشتراك Growth — مايو 2026',
        descriptionEn: 'Growth plan — May 2026',
        amount: 149,
        kind: 'subscription',
      },
    ],
  },
  {
    id: 'inv-1002',
    number: 'NQ-2026-1002',
    accountType: 'company',
    accountId: 'comp-1',
    accountName: 'Jawwal',
    status: 'pending',
    issuedAt: '2026-06-01',
    dueAt: '2026-06-15',
    currency: 'USD',
    subtotal: 189,
    tax: 0,
    total: 189,
    lines: [
      {
        descriptionAr: 'اشتراك Growth — يونيو 2026',
        descriptionEn: 'Growth plan — June 2026',
        amount: 149,
        kind: 'subscription',
      },
      {
        descriptionAr: 'تمييز إعلان وظيفي',
        descriptionEn: 'Featured job listing',
        amount: 40,
        kind: 'featured',
      },
    ],
  },
  {
    id: 'inv-1003',
    number: 'NQ-2026-1003',
    accountType: 'company',
    accountId: 'comp-2',
    accountName: 'PalPay',
    status: 'overdue',
    issuedAt: '2026-04-01',
    dueAt: '2026-04-15',
    currency: 'USD',
    subtotal: 49,
    tax: 0,
    total: 49,
    lines: [
      {
        descriptionAr: 'اشتراك Starter — أبريل 2026',
        descriptionEn: 'Starter plan — April 2026',
        amount: 49,
        kind: 'subscription',
      },
    ],
  },
  {
    id: 'inv-1004',
    number: 'NQ-2026-1004',
    accountType: 'company',
    accountId: 'comp-3',
    accountName: 'Exalt',
    status: 'paid',
    issuedAt: '2026-05-10',
    dueAt: '2026-05-25',
    paidAt: '2026-05-12',
    currency: 'USD',
    subtotal: 399,
    tax: 0,
    total: 399,
    lines: [
      {
        descriptionAr: 'اشتراك Enterprise — مايو 2026',
        descriptionEn: 'Enterprise plan — May 2026',
        amount: 399,
        kind: 'subscription',
      },
    ],
  },
  {
    id: 'inv-2001',
    number: 'NQ-2026-2001',
    accountType: 'user',
    accountId: 'user-1',
    accountName: 'محمد نوفل',
    status: 'paid',
    issuedAt: '2026-03-12',
    dueAt: '2026-03-20',
    paidAt: '2026-03-12',
    currency: 'USD',
    subtotal: 35,
    tax: 0,
    total: 35,
    lines: [
      {
        descriptionAr: 'كورس Full Stack Career Boost',
        descriptionEn: 'Full Stack Career Boost course',
        amount: 35,
        kind: 'course',
      },
    ],
  },
  {
    id: 'inv-2002',
    number: 'NQ-2026-2002',
    accountType: 'user',
    accountId: 'user-1',
    accountName: 'محمد نوفل',
    status: 'pending',
    issuedAt: '2026-06-01',
    dueAt: '2026-06-20',
    currency: 'USD',
    subtotal: 15,
    tax: 0,
    total: 15,
    lines: [
      {
        descriptionAr: 'إصدار شهادة إتمام كورس',
        descriptionEn: 'Course completion certificate',
        amount: 15,
        kind: 'certification',
      },
    ],
  },
  {
    id: 'inv-3001',
    number: 'NQ-2026-3001',
    accountType: 'company',
    accountId: 'uni-1',
    accountName: 'جامعة بيرزيت — مركز التوظيف',
    status: 'paid',
    issuedAt: '2026-01-05',
    dueAt: '2026-01-31',
    paidAt: '2026-01-08',
    currency: 'USD',
    subtotal: 200,
    tax: 0,
    total: 200,
    lines: [
      {
        descriptionAr: 'رسوم شراكة جامعية 2026',
        descriptionEn: 'University partnership fee 2026',
        amount: 200,
        kind: 'partnership',
      },
    ],
  },
];

const baseSubscriptions: Subscription[] = [
  {
    id: 'sub-comp-1',
    accountId: 'comp-1',
    accountName: 'Jawwal',
    planId: 'growth',
    status: 'active',
    renewsAt: '2026-07-01',
    seats: 12,
  },
  {
    id: 'sub-comp-2',
    accountId: 'comp-2',
    accountName: 'PalPay',
    planId: 'starter',
    status: 'past_due',
    renewsAt: '2026-05-01',
    seats: 4,
  },
  {
    id: 'sub-comp-3',
    accountId: 'comp-3',
    accountName: 'Exalt',
    planId: 'enterprise',
    status: 'active',
    renewsAt: '2026-07-10',
    seats: 40,
  },
];

/** Mutable demo store (in-memory). Resets on server restart. */
let invoiceStore: Invoice[] = structuredClone(baseInvoices);
let subscriptionStore: Subscription[] = structuredClone(baseSubscriptions);

export function resetBillingMock() {
  invoiceStore = structuredClone(baseInvoices);
  subscriptionStore = structuredClone(baseSubscriptions);
}

export function listBillingInvoices() {
  return invoiceStore;
}

export function listBillingSubscriptions() {
  return subscriptionStore;
}

export function payMockInvoice(invoiceId: string): Invoice | null {
  const inv = invoiceStore.find((i) => i.id === invoiceId);
  if (!inv) return null;
  if (inv.status === 'paid' || inv.status === 'void') return inv;
  inv.status = 'paid';
  inv.paidAt = new Date().toISOString().slice(0, 10);
  return inv;
}

export function changeMockPlan(accountId: string, planId: BillingPlan['id']): Subscription | null {
  const sub = subscriptionStore.find((s) => s.accountId === accountId);
  const plan = billingPlans.find((p) => p.id === planId);
  if (!plan) return null;
  if (sub) {
    sub.planId = planId;
    sub.status = 'active';
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    sub.renewsAt = d.toISOString().slice(0, 10);
    return sub;
  }
  const created: Subscription = {
    id: `sub-${accountId}`,
    accountId,
    accountName: accountId,
    planId,
    status: 'trialing',
    renewsAt: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    seats: 3,
  };
  subscriptionStore = [created, ...subscriptionStore];
  return created;
}

function sumPaid(invoices: Invoice[], from?: string, to?: string) {
  return invoices
    .filter((i) => i.status === 'paid')
    .filter((i) => {
      const d = i.paidAt ?? i.issuedAt;
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    })
    .reduce((s, i) => s + i.total, 0);
}

export function buildBillingOverview(opts?: {
  accountId?: string;
  accountType?: 'company' | 'user' | 'all';
}): BillingOverview {
  const accountType = opts?.accountType ?? 'all';
  const accountId = opts?.accountId;

  let invoices = [...invoiceStore];
  let subscriptions = [...subscriptionStore];

  if (accountType === 'company' && accountId) {
    invoices = invoices.filter(
      (i) => i.accountType === 'company' && i.accountId === accountId
    );
    subscriptions = subscriptions.filter((s) => s.accountId === accountId);
  } else if (accountType === 'user' && accountId) {
    invoices = invoices.filter((i) => i.accountType === 'user' && i.accountId === accountId);
    subscriptions = [];
  }

  const outstanding = invoices
    .filter((i) => i.status === 'pending' || i.status === 'overdue')
    .reduce((s, i) => s + i.total, 0);

  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const paidThisMonth = sumPaid(invoices, monthStart);
  const ytdRevenue = sumPaid(
    accountType === 'all' ? invoiceStore : invoices,
    `${now.getFullYear()}-01-01`
  );

  const mrr = subscriptions
    .filter((s) => s.status === 'active' || s.status === 'trialing')
    .reduce((s, sub) => {
      const plan = billingPlans.find((p) => p.id === sub.planId);
      return s + (plan?.priceMonthly ?? 0);
    }, 0);

  const monthlyRevenue =
    accountType === 'all'
      ? [
          { month: 'Jan', revenue: 18200, fees: 2100 },
          { month: 'Feb', revenue: 20100, fees: 2400 },
          { month: 'Mar', revenue: 22400, fees: 2800 },
          { month: 'Apr', revenue: 23800, fees: 3100 },
          { month: 'May', revenue: 26100, fees: 3400 },
          { month: 'Jun', revenue: 28500, fees: 3900 },
        ]
      : [
          { month: 'Jan', revenue: 149, fees: 0 },
          { month: 'Feb', revenue: 149, fees: 25 },
          { month: 'Mar', revenue: 149, fees: 40 },
          { month: 'Apr', revenue: 149, fees: 0 },
          { month: 'May', revenue: 149, fees: 40 },
          { month: 'Jun', revenue: invoices.filter((i) => i.status !== 'void').reduce((s, i) => s + (i.status === 'paid' ? i.total : 0), 0) || 149, fees: 40 },
        ];

  return {
    isMock: true,
    currency: 'USD',
    mrr: accountType === 'all' ? mrr || 245000 / 12 : mrr,
    ytdRevenue: accountType === 'all' ? Math.max(ytdRevenue, 245000) : ytdRevenue,
    outstanding,
    paidThisMonth: accountType === 'all' ? Math.max(paidThisMonth, 28500) : paidThisMonth,
    activeSubscriptions:
      accountType === 'all'
        ? subscriptionStore.filter((s) => s.status === 'active' || s.status === 'trialing').length
        : subscriptions.filter((s) => s.status === 'active' || s.status === 'trialing').length,
    monthlyRevenue,
    plans: billingPlans,
    feeCatalog,
    subscriptions: accountType === 'all' ? subscriptionStore : subscriptions,
    invoices,
    mySubscription: subscriptions[0] ?? null,
  };
}
