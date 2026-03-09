import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  const { id } = await params;
  const { note } = await request.json().catch(() => ({ note: '' }));
  const supabase = createAdminClient();

  await supabase.from('match_results').update({
    resolution_status: 'UNRESOLVED',
  }).eq('id', id);

  return NextResponse.json({ success: true });
}
