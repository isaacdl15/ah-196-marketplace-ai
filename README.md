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

## Build Patterns

Before writing any product code, read:
`/home/openclaw3/.openclaw/workspace/shared/findings/build-patterns.md`

Key rules:
- Import server env vars only from `lib/env.server.ts` (never in client components)
- Import client env vars from `lib/env.client.ts`
- Define all Storage bucket names in `lib/storage.ts`
- Use `upsert()` not `insert()` on tables with auth triggers
- Role checks: `['ROLE_A','ROLE_B'].includes(role)` not `role !== 'ROLE_A'`
