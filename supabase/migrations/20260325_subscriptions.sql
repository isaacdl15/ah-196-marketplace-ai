-- Subscriptions table for Stripe integration

-- Create handle_updated_at function if it doesn't exist
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists public.subscriptions (
  user_id                uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id     text unique,
  stripe_subscription_id text unique,
  plan                   text not null default 'free' check (plan in ('free', 'starter', 'pro', 'enterprise')),
  status                 text not null default 'active' check (status in ('active', 'trialing', 'past_due', 'canceled', 'incomplete')),
  current_period_end     timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- RLS
alter table public.subscriptions enable row level security;

create policy "Users can read own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Service role can write (via webhook)
create policy "Service role can manage subscriptions"
  on public.subscriptions for all
  using (auth.role() = 'service_role');

-- Auto-update updated_at
create trigger update_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute procedure public.handle_updated_at();
