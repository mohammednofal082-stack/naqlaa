import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/backend/data/api';
import { createSupabaseAdminClient, hasSupabaseAdmin } from '@/backend/supabase/admin';

const FOLDERS = new Set(['posts', 'messages', 'companies', 'lessons']);
const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!hasSupabaseAdmin()) {
      return NextResponse.json({ error: 'STORAGE_NOT_CONFIGURED' }, { status: 503 });
    }

    const form = await req.formData();
    const file = form.get('file');
    const folderRaw = String(form.get('folder') ?? 'posts');
    const folder = FOLDERS.has(folderRaw) ? folderRaw : 'posts';

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'NO_FILE' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'FILE_TOO_LARGE' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^\w.\-ء-ي]+/g, '_');
    const path = `${folder}/${user.userId}/${Date.now()}-${safeName}`;
    const admin = createSupabaseAdminClient();
    const { error } = await admin.storage.from('media').upload(path, buffer, {
      contentType: file.type || 'application/octet-stream',
      upsert: true,
    });
    if (error) throw error;
    const { data } = admin.storage.from('media').getPublicUrl(path);
    return NextResponse.json({
      data: { url: data.publicUrl, path, fileName: file.name },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'UPLOAD_FAILED';
    const status = message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
