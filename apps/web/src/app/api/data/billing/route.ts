import { NextRequest } from 'next/server';
import {
  buildBillingOverview,
  changeMockPlan,
  payMockInvoice,
  type BillingPlanId,
} from '@careerlink/shared';
import { dataResponse, mutationResponse, requireAuth } from '@/backend/data/api';
import { requireAnyRole } from '@/backend/auth/rbac';

/**
 * Billing is intentionally mock-only (no Stripe / DB tables).
 * Demo mutations live in shared in-memory store for the process lifetime.
 */
export async function GET(req: NextRequest) {
  return dataResponse(async () => {
    const user = await requireAuth();
    const scope = req.nextUrl.searchParams.get('scope') ?? 'auto';
    const roles = user.roles ?? [];

    if (scope === 'admin' || (scope === 'auto' && roles.includes('admin'))) {
      await requireAnyRole('admin');
      return buildBillingOverview({ accountType: 'all' });
    }

    if (
      scope === 'company' ||
      (scope === 'auto' && (roles.includes('company') || roles.includes('hr')))
    ) {
      await requireAnyRole('company', 'hr', 'admin');
      const accountId = user.organizationId || 'comp-1';
      let overview = buildBillingOverview({ accountType: 'company', accountId });
      if (overview.invoices.length === 0 && accountId !== 'comp-1') {
        overview = buildBillingOverview({ accountType: 'company', accountId: 'comp-1' });
      }
      return overview;
    }

    // student / graduate / trainer / mentor / university → personal fees (demo fallback)
    let overview = buildBillingOverview({
      accountType: 'user',
      accountId: user.userId,
    });
    if (overview.invoices.length === 0) {
      overview = buildBillingOverview({ accountType: 'user', accountId: 'user-1' });
      overview = {
        ...overview,
        invoices: overview.invoices.map((inv) => ({
          ...inv,
          accountId: user.userId,
          accountName: user.fullName || inv.accountName,
        })),
      };
    }
    return overview;
  });
}

export async function POST(req: NextRequest) {
  return mutationResponse(async () => {
    const user = await requireAuth();
    const body = await req.json();
    const action = String(body.action ?? '');

    if (action === 'pay') {
      const invoiceId = String(body.invoiceId ?? '');
      const inv = payMockInvoice(invoiceId);
      if (!inv) throw new Error('NOT_FOUND');
      return { invoice: inv, message: 'MOCK_PAYMENT_OK' };
    }

    if (action === 'change_plan') {
      await requireAnyRole('company', 'hr', 'admin');
      const planId = String(body.planId ?? '') as BillingPlanId;
      const accountId =
        rolesHas(user.roles, 'admin') && body.accountId
          ? String(body.accountId)
          : user.organizationId || 'comp-1';
      const sub = changeMockPlan(accountId, planId);
      if (!sub) throw new Error('NOT_FOUND');
      return { subscription: sub, message: 'MOCK_PLAN_CHANGED' };
    }

    throw new Error('INVALID_ACTION');
  });
}

function rolesHas(roles: string[] | undefined, role: string) {
  return (roles ?? []).includes(role);
}
