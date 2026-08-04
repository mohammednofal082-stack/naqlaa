import { NextRequest } from 'next/server';
import { dataResponse, mutationResponse, getRepo, requireAuth } from '@/backend/data/api';
import { createSupabaseServerClient } from '@/backend/supabase/server';
import { requireAnyRole } from '@/backend/auth/rbac';

export async function GET(req: NextRequest) {
  return dataResponse(async () => {
    const user = await requireAuth();
    const eventId = req.nextUrl.searchParams.get('eventId');
    const supabase = await createSupabaseServerClient();

    // University/admin can list all registrants for an event
    if (eventId && (user.role === 'university' || user.role === 'admin' || user.role === 'company')) {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('*, profiles:user_id(full_name, email)')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row) => ({
        id: String(row.id),
        eventId: String(row.event_id),
        userId: String(row.user_id),
        qrCode: String(row.qr_code),
        checkedIn: Boolean(row.checked_in),
        checkedInAt: row.checked_in_at ? String(row.checked_in_at) : null,
        profiles: row.profiles,
      }));
    }

    let query = supabase
      .from('event_registrations')
      .select('*, events(*)')
      .eq('user_id', user.userId)
      .order('created_at', { ascending: false });
    if (eventId) query = query.eq('event_id', eventId);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: String(row.id),
      eventId: String(row.event_id),
      userId: String(row.user_id),
      qrCode: String(row.qr_code),
      checkedIn: Boolean(row.checked_in),
      checkedInAt: row.checked_in_at ? String(row.checked_in_at) : null,
      eventTitle: row.events ? String((row.events as { title?: string }).title ?? '') : '',
    }));
  });
}

export async function POST(req: NextRequest) {
  return mutationResponse(async () => {
    await requireAuth();
    const body = await req.json();
    if (body.action === 'check-in') {
      await requireAnyRole('university', 'company', 'admin', 'hr');
      const supabase = await createSupabaseServerClient();
      const qr = String(body.qrCode ?? '');
      const { data, error } = await supabase
        .from('event_registrations')
        .update({ checked_in: true, checked_in_at: new Date().toISOString() })
        .eq('qr_code', qr)
        .select('*, events(title)')
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('NOT_FOUND');
      return {
        id: String(data.id),
        qrCode: String(data.qr_code),
        checkedIn: true,
        eventTitle: data.events ? String((data.events as { title?: string }).title ?? '') : '',
      };
    }

    // register
    const eventId = String(body.eventId ?? '');
    return getRepo().registerForEvent(eventId);
  });
}
