export const runtime = 'nodejs';
import { createClient } from '@supabase/supabase-js';

const adminClient = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function GET() {
  const admin = adminClient();

  const checks: Record<string, boolean> = {};
  
  for (const table of ['mp_payouts', 'mp_template_views']) {
    const { error } = await admin.from(table).select('id').limit(1);
    checks[table] = !error;
  }

  const allExist = Object.values(checks).every(Boolean);

  return Response.json({ 
    status: allExist ? 'ok' : 'migration_needed',
    tables: checks,
    message: allExist 
      ? 'All Phase 2 tables exist' 
      : 'Some tables missing — apply supabase/migrations/20260330200000_add_payouts.sql',
  });
}
