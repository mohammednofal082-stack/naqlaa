import { createSupabaseAdminClient, hasSupabaseAdmin } from '@/backend/supabase/admin';
import { createSupabaseServerClient } from '@/backend/supabase/server';

export async function notifyUser(input: {
  userId: string;
  title: string;
  message: string;
  link?: string;
  type?: string;
  email?: string;
}) {
  try {
    const supabase = hasSupabaseAdmin()
      ? createSupabaseAdminClient()
      : await createSupabaseServerClient();

    await supabase.from('notifications').insert({
      user_id: input.userId,
      type: input.type ?? 'system',
      title: input.title,
      message: input.message,
      link: input.link ?? null,
      read: false,
    });
  } catch (e) {
    console.warn('notifyUser in-app failed', e);
  }

  const emailTo = input.email;
  const resendKey = process.env.RESEND_API_KEY;
  if (!emailTo || !resendKey) return;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || 'Naqla <onboarding@resend.dev>',
        to: [emailTo],
        subject: input.title,
        html: `<div dir="rtl" style="font-family:Tahoma,sans-serif"><h2>${input.title}</h2><p>${input.message}</p>${
          input.link ? `<p><a href="${input.link}">فتح في نقلة</a></p>` : ''
        }</div>`,
      }),
    });
  } catch (e) {
    console.warn('notifyUser email failed', e);
  }
}
