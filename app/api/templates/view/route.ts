export const runtime = 'nodejs';
import { createClient } from '@supabase/supabase-js';

const adminClient = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { templateId, viewerId } = await request.json();

    if (!templateId) {
      return Response.json({ error: 'templateId required' }, { status: 400 });
    }

    const admin = adminClient();
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor?.split(',')[0]?.trim() ?? '';
    const ipHash = ip ? Buffer.from(ip).toString('base64').slice(0, 16) : null;

    await admin.from('mp_template_views').insert({
      template_id: templateId,
      viewer_id: viewerId ?? null,
      ip_hash: ipHash,
      referrer: request.headers.get('referer'),
    });

    return Response.json({ recorded: true });
  } catch {
    return Response.json({ recorded: false });
  }
}
