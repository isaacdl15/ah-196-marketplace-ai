export const runtime = 'nodejs';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const { email, isCreator, utmSource, utmMedium, utmCampaign, referralCode } = await request.json();

  // Validate email
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Invalid email format' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Check duplicate
  const { data: existing } = await supabase
    .from('mp_waitlist_entries')
    .select('id')
    .eq('email', email)
    .single();

  if (existing) {
    return Response.json({ message: 'Email already on waitlist' }, { status: 409 });
  }

  const { data, error } = await supabase
    .from('mp_waitlist_entries')
    .insert({
      email,
      is_creator: isCreator || false,
      utm_source: utmSource || null,
      utm_medium: utmMedium || null,
      utm_campaign: utmCampaign || null,
      referral_code: referralCode || null,
      status: 'pending',
    })
    .select('id')
    .single();

  if (error) {
    console.error('Signup error:', error);
    return Response.json({ error: 'Signup failed' }, { status: 500 });
  }

  return Response.json({
    success: true,
    waitlistId: data.id,
    message: 'Welcome to the waitlist! Check your email.',
  });
}
