import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { BUCKETS } from '@/lib/storage';

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  const formData = await request.formData();
  const file = formData.get('file') as File;
  const eventId = formData.get('eventId') as string;

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  if (file.size > 50 * 1024 * 1024) return NextResponse.json({ error: 'File exceeds 50 MB limit' }, { status: 400 });

  const supabase = createAdminClient();

  const { data: upload, error: uploadError } = await supabase
    .from('csv_uploads')
    .insert({
      filename: file.name,
      storage_path: '',
      event_id: eventId || null,
      status: 'UPLOADED',
      uploaded_by: auth.user.id,
    })
    .select()
    .single();

  if (uploadError || !upload) {
    return NextResponse.json({ error: 'Failed to create upload record' }, { status: 500 });
  }

  const storagePath = `${upload.id}/${file.name}`;
  const { error: storageError } = await supabase.storage
    .from(BUCKETS.daedoCsvs)
    .upload(storagePath, file);

  if (storageError) {
    await supabase.from('csv_uploads').update({ status: 'FAILED', error_details: { error: storageError.message } }).eq('id', upload.id);
    return NextResponse.json({ error: 'File upload failed' }, { status: 500 });
  }

  await supabase.from('csv_uploads').update({ storage_path: storagePath }).eq('id', upload.id);

  return NextResponse.json({ success: true, uploadId: upload.id, storagePath });
}
