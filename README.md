# __PROJECT_NAME__

Built with [Angel Agents](https://angelagents.vercel.app) · Next.js 14 + Supabase + Vercel

## Stack

- Next.js 14 (App Router, TypeScript)
- Supabase (auth, database, RLS)
- Tailwind CSS
- Vercel (deployment)

## Getting started

1. Copy `.env.example` to `.env.local` and fill in your Supabase credentials
2. `npm install`
3. `supabase db push` (if using Supabase CLI)
4. `npm run dev`

## Customize (BUILD agents)

```bash
node scripts/customize.js --manifest='{"name":"My App","description":"My description","primaryColor":"#E86F2C","supabaseUrl":"https://...","supabaseAnonKey":"..."}'
```

## Deploy

```bash
vercel --prod --yes
```
