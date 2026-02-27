// Client-safe environment variables — safe to import anywhere
// Only NEXT_PUBLIC_ vars here — they are statically inlined by Next.js at build time

export const clientEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? '',
};
