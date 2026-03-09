import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { recalculateRankings } from '@/lib/ranking/recalculate';

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  const supabase = createAdminClient();

  try {
    await recalculateRankings(supabase);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Recalculation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
