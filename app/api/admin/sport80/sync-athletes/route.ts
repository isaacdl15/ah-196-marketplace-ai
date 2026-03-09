import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/require-admin';
import { syncAthletes, Sport80Error } from '@/lib/sport80/client';

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  const body = await request.json().catch(() => ({}));

  try {
    const result = await syncAthletes(body.updatedSince);
    return NextResponse.json({ success: true, count: result.count });
  } catch (err) {
    if (err instanceof Sport80Error && err.status === 503) {
      return NextResponse.json({ error: 'Sport80 sync unavailable — check API token and IP whitelist' }, { status: 503 });
    }
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
