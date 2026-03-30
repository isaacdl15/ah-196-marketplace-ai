-- Phase 2: mp_payouts table for payout tracking

CREATE TABLE IF NOT EXISTS mp_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES mp_profiles(id) ON DELETE CASCADE,
  amount_cents INT NOT NULL DEFAULT 0,
  stripe_payout_id TEXT,
  stripe_account_id TEXT,
  status TEXT NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested', 'processing', 'paid', 'failed', 'cancelled')),
  payout_method TEXT DEFAULT 'stripe',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS mp_payouts_profile_idx ON mp_payouts(profile_id);
CREATE INDEX IF NOT EXISTS mp_payouts_status_idx ON mp_payouts(status);

ALTER TABLE mp_payouts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'mp_payouts_own_select' AND tablename = 'mp_payouts') THEN
    CREATE POLICY mp_payouts_own_select ON mp_payouts FOR SELECT
      USING (auth.uid() IN (SELECT user_id FROM mp_profiles WHERE id = profile_id) OR auth.role() = 'service_role');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'mp_payouts_insert_service' AND tablename = 'mp_payouts') THEN
    CREATE POLICY mp_payouts_insert_service ON mp_payouts FOR INSERT
      WITH CHECK (auth.role() = 'service_role' OR auth.uid() IN (SELECT user_id FROM mp_profiles WHERE id = profile_id));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'mp_payouts_update_service' AND tablename = 'mp_payouts') THEN
    CREATE POLICY mp_payouts_update_service ON mp_payouts FOR UPDATE
      USING (auth.role() = 'service_role');
  END IF;
END $$;

-- mp_template_views: track views per template for analytics
CREATE TABLE IF NOT EXISTS mp_template_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES mp_templates(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_hash TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS mp_template_views_template_idx ON mp_template_views(template_id);
CREATE INDEX IF NOT EXISTS mp_template_views_created_idx ON mp_template_views(created_at);

ALTER TABLE mp_template_views ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'mp_template_views_insert' AND tablename = 'mp_template_views') THEN
    CREATE POLICY mp_template_views_insert ON mp_template_views FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'mp_template_views_select_service' AND tablename = 'mp_template_views') THEN
    CREATE POLICY mp_template_views_select_service ON mp_template_views FOR SELECT
      USING (auth.role() = 'service_role');
  END IF;
END $$;
