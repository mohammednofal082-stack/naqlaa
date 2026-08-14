import { NextRequest } from 'next/server';
import { dataResponse, mutationResponse } from '@/backend/data/api';
import { requirePermission } from '@/backend/auth/rbac';
import {
  getPendingPartnerships,
  setUserStatus,
  getUserById,
  getAllUsers,
} from '@/backend/auth/store';
import { useSupabaseAuth } from '@/backend/config/env';
import { createSupabaseAdminClient, hasSupabaseAdmin } from '@/backend/supabase/admin';
import { initialsAvatar } from '@careerlink/shared';
import { initMemoryStore, memoryStore } from '@/backend/data/memory-store';

function mapAuthUser(u: {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  status: string;
  organizationId?: string;
  avatar: string;
  createdAt: string;
  companyName?: string;
  universityName?: string;
}) {
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    roles: u.roles,
    status: u.status,
    organizationId: u.organizationId,
    avatar: u.avatar,
    createdAt: u.createdAt,
    companyName: u.companyName,
    universityName: u.universityName,
  };
}

async function listPending() {
  if (useSupabaseAuth() && hasSupabaseAdmin()) {
    const admin = createSupabaseAdminClient();
    const { data } = await admin
      .from('profiles')
      .select('id, full_name, email, roles, status, organization_id, created_at, avatar_url')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    return (data ?? [])
      .filter((p) => {
        const roles = (p.roles as string[]) ?? [];
        return roles.includes('company') || roles.includes('university');
      })
      .map((p) => ({
        id: p.id,
        email: String(p.email ?? ''),
        fullName: String(p.full_name ?? ''),
        roles: (p.roles as string[]) ?? [],
        status: String(p.status),
        organizationId: p.organization_id ? String(p.organization_id) : undefined,
        avatar: String(p.avatar_url || initialsAvatar(String(p.full_name ?? 'U'))),
        createdAt: String(p.created_at ?? '').slice(0, 10),
        companyName: undefined as string | undefined,
        universityName: undefined as string | undefined,
      }));
  }
  return getPendingPartnerships().map(mapAuthUser);
}

export async function GET() {
  return dataResponse(async () => {
    await requirePermission('admin.verify');
    const pending = await listPending();
    const accounts = useSupabaseAuth()
      ? pending
      : getAllUsers()
          .filter((u) => u.roles.includes('company') || u.roles.includes('university'))
          .map(mapAuthUser);
    return { pending, accounts };
  });
}

export async function POST(req: NextRequest) {
  return mutationResponse(async () => {
    await requirePermission('admin.verify');
    const body = await req.json();
    const userId = String(body.userId || '');
    const action = String(body.action || '') as 'approve' | 'reject' | 'suspend';
    if (!userId || !['approve', 'reject', 'suspend'].includes(action)) {
      throw new Error('INVALID_INPUT');
    }

    const nextStatus = action === 'approve' ? 'active' : action === 'reject' ? 'deleted' : 'suspended';

    if (useSupabaseAuth() && hasSupabaseAdmin()) {
      const admin = createSupabaseAdminClient();
      const { data: profile } = await admin.from('profiles').select('*').eq('id', userId).single();
      if (!profile) throw new Error('NOT_FOUND');
      await admin.from('profiles').update({ status: nextStatus }).eq('id', userId);
      if (action === 'approve' && profile.organization_id) {
        await admin.from('companies').update({ verified: true }).eq('id', profile.organization_id);
      }
      return { success: true, status: nextStatus };
    }

    const user = getUserById(userId);
    if (!user) throw new Error('NOT_FOUND');
    const updated = setUserStatus(userId, nextStatus);
    if (!updated) throw new Error('NOT_FOUND');

    if (action === 'approve' && user.roles.includes('company')) {
      initMemoryStore();
      let company = memoryStore.companies.find(
        (c) => c.id === user.organizationId || c.email === user.email,
      );
      if (!company) {
        company = {
          id: user.organizationId || `comp-${Date.now()}`,
          name: user.companyName || user.fullName,
          email: user.email,
          logo: user.avatar,
          coverImage: '',
          industry: 'Technology',
          location: 'Palestine',
          website: '',
          about: '',
          employees: 0,
          followers: 0,
          activeJobs: 0,
          verified: true,
          verificationStatus: 'approved',
          founded: new Date().getFullYear(),
        };
        memoryStore.companies.unshift(company);
      } else {
        company.verified = true;
        company.verificationStatus = 'approved';
      }
    }

    return { success: true, status: nextStatus, user: updated };
  });
}
