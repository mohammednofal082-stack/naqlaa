import { NextRequest } from 'next/server';
import { dataResponse, mutationResponse } from '@/backend/data/api';
import { requireAnyRole } from '@/backend/auth/rbac';
import {
  getHrAccountsForCompany,
  registerUser,
  updateHrPermissions,
  setUserStatus,
  getUserById,
} from '@/backend/auth/store';
import { validateEmail, validatePassword } from '@/backend/auth/password';
import { HR_MANAGEABLE_PERMISSIONS, ROLE_PERMISSIONS } from '@careerlink/shared';
import { useSupabaseAuth } from '@/backend/config/env';
import { createSupabaseAdminClient, hasSupabaseAdmin } from '@/backend/supabase/admin';
import { registerNewUser } from '@/backend/auth/provider';

const ALLOWED = new Set(HR_MANAGEABLE_PERMISSIONS.map((p) => p.code));

function sanitizePermissions(input: unknown): string[] {
  const list = Array.isArray(input) ? input.map(String) : [];
  const filtered = list.filter((c) => ALLOWED.has(c as never));
  return filtered.length > 0 ? filtered : [...ROLE_PERMISSIONS.hr];
}

export async function GET() {
  return dataResponse(async () => {
    const session = await requireAnyRole('company', 'admin');
    const orgId = session.organizationId;
    if (!orgId && session.role !== 'admin') {
      return { accounts: [], permissionsCatalog: HR_MANAGEABLE_PERMISSIONS };
    }

    if (useSupabaseAuth() && hasSupabaseAdmin() && orgId) {
      const admin = createSupabaseAdminClient();
      const { data } = await admin
        .from('profiles')
        .select('id, full_name, email, roles, status, organization_id, avatar_url, created_at')
        .eq('organization_id', orgId)
        .contains('roles', ['hr']);
      return {
        accounts: (data ?? []).map((p) => ({
          id: p.id,
          email: String(p.email ?? ''),
          fullName: String(p.full_name ?? ''),
          status: String(p.status ?? 'active'),
          avatar: String(p.avatar_url ?? ''),
          permissions: ROLE_PERMISSIONS.hr,
          createdAt: String(p.created_at ?? '').slice(0, 10),
        })),
        permissionsCatalog: HR_MANAGEABLE_PERMISSIONS,
      };
    }

    const accounts = getHrAccountsForCompany(orgId || 'comp-1').map((u) => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      status: u.status,
      avatar: u.avatar,
      permissions: u.permissions ?? ROLE_PERMISSIONS.hr,
      createdAt: u.createdAt,
    }));
    return { accounts, permissionsCatalog: HR_MANAGEABLE_PERMISSIONS };
  });
}

export async function POST(req: NextRequest) {
  return mutationResponse(async () => {
    const session = await requireAnyRole('company');
    const orgId = session.organizationId;
    if (!orgId) throw new Error('COMPANY_ORG_REQUIRED');

    // Only active company accounts can create HR
    if (useSupabaseAuth() && hasSupabaseAdmin()) {
      const admin = createSupabaseAdminClient();
      const { data: owner } = await admin.from('profiles').select('status').eq('id', session.userId).maybeSingle();
      if (owner && String(owner.status) !== 'active') throw new Error('COMPANY_NOT_APPROVED');
    } else if (!useSupabaseAuth()) {
      const owner = getUserById(session.userId);
      if (owner && owner.status !== 'active') throw new Error('COMPANY_NOT_APPROVED');
    }

    const body = await req.json();
    const fullName = String(body.fullName || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const permissions = sanitizePermissions(body.permissions);

    if (!fullName || !email || !password) throw new Error('MISSING_FIELDS');
    if (!validateEmail(email)) throw new Error('INVALID_EMAIL');
    const pw = validatePassword(password);
    if (!pw.valid) throw new Error(pw.errors[0] || 'WEAK_PASSWORD');

    if (useSupabaseAuth()) {
      const result = await registerNewUser({
        email,
        password,
        fullName,
        role: 'hr',
        organizationId: orgId,
        status: 'active',
        permissions,
        skipAutoLogin: true,
      });
      if (result.error) throw new Error(result.error);
      return {
        account: {
          email,
          fullName,
          status: 'active',
          permissions,
        },
      };
    }

    const created = registerUser({
      email,
      password,
      fullName,
      role: 'hr',
      organizationId: orgId,
      status: 'active',
      permissions,
    });
    if (created.error || !created.user) throw new Error(created.error || 'CREATE_FAILED');

    return {
      account: {
        id: created.user.id,
        email: created.user.email,
        fullName: created.user.fullName,
        status: created.user.status,
        avatar: created.user.avatar,
        permissions: created.user.permissions ?? permissions,
        createdAt: created.user.createdAt,
      },
    };
  });
}

export async function PATCH(req: NextRequest) {
  return mutationResponse(async () => {
    const session = await requireAnyRole('company', 'admin');
    const body = await req.json();
    const userId = String(body.userId || '');
    if (!userId) throw new Error('MISSING_USER');

    if (useSupabaseAuth() && hasSupabaseAdmin()) {
      const admin = createSupabaseAdminClient();
      const { data: target, error } = await admin
        .from('profiles')
        .select('id, full_name, email, roles, status, organization_id, avatar_url, created_at')
        .eq('id', userId)
        .maybeSingle();
      if (error) throw error;
      const roles = (target?.roles as string[] | undefined) ?? [];
      if (!target || !roles.includes('hr')) throw new Error('NOT_FOUND');
      if (session.role === 'company' && String(target.organization_id ?? '') !== session.organizationId) {
        throw new Error('FORBIDDEN');
      }

      if (body.permissions) {
        const permissions = sanitizePermissions(body.permissions);
        await admin.auth.admin.updateUserById(userId, {
          user_metadata: { permissions, role: 'hr' },
        });
        return {
          account: {
            id: target.id,
            email: String(target.email ?? ''),
            fullName: String(target.full_name ?? ''),
            status: String(target.status ?? 'active'),
            avatar: String(target.avatar_url ?? ''),
            permissions,
            createdAt: String(target.created_at ?? '').slice(0, 10),
          },
        };
      }

      if (body.status === 'suspended' || body.status === 'active') {
        await admin.from('profiles').update({ status: body.status }).eq('id', userId);
        return {
          account: {
            id: target.id,
            email: String(target.email ?? ''),
            fullName: String(target.full_name ?? ''),
            status: body.status,
            avatar: String(target.avatar_url ?? ''),
            permissions: ROLE_PERMISSIONS.hr,
            createdAt: String(target.created_at ?? '').slice(0, 10),
          },
        };
      }

      throw new Error('NO_CHANGES');
    }

    const target = getUserById(userId);
    if (!target || !target.roles.includes('hr')) throw new Error('NOT_FOUND');
    if (session.role === 'company' && target.organizationId !== session.organizationId) {
      throw new Error('FORBIDDEN');
    }

    if (body.permissions) {
      const permissions = sanitizePermissions(body.permissions);
      const updated = updateHrPermissions(userId, permissions);
      return { account: updated };
    }

    if (body.status === 'suspended' || body.status === 'active') {
      const updated = setUserStatus(userId, body.status);
      return { account: updated };
    }

    throw new Error('NO_CHANGES');
  });
}
