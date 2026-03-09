import { createClient } from '@/lib/supabase/server';

export async function requireAdmin(): Promise<{ error: Response } | { user: { id: string; email: string } }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.is_admin !== true) {
    return { error: new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } }) };
  }
  return { user: { id: user.id, email: user.email! } };
}
