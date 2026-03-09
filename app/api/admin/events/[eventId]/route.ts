import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  const { eventId } = await params;
  const body = await request.json();
  const supabase = createAdminClient();

  const updates: Record<string, unknown> = {};
  if (body.grade !== undefined) updates.grade = body.grade;
  if (body.gradeTier !== undefined) updates.grade_tier = body.gradeTier;
  if (body.isMandatory !== undefined) updates.is_mandatory = body.isMandatory;

  const { data, error } = await supabase.from('events').update(updates).eq('id', eventId).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
