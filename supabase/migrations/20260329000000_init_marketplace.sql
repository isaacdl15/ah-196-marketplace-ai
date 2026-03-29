CREATE TABLE IF NOT EXISTS mp_waitlist_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'confirmed', 'unsubscribed')),
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referral_code TEXT,
  is_creator BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS mp_waitlist_email_idx ON mp_waitlist_entries (email);
CREATE INDEX IF NOT EXISTS mp_waitlist_status_idx ON mp_waitlist_entries (status, created_at DESC);
CREATE INDEX IF NOT EXISTS mp_waitlist_creator_idx ON mp_waitlist_entries (is_creator, created_at DESC);

CREATE TABLE IF NOT EXISTS mp_email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  waitlist_id UUID NOT NULL REFERENCES mp_waitlist_entries (id) ON DELETE CASCADE,
  email_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS mp_email_logs_status_idx ON mp_email_logs (status, created_at DESC);

ALTER TABLE mp_waitlist_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE mp_email_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'mp_waitlist_public_read' AND tablename = 'mp_waitlist_entries') THEN
    CREATE POLICY mp_waitlist_public_read ON mp_waitlist_entries FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'mp_waitlist_insert_service' AND tablename = 'mp_waitlist_entries') THEN
    CREATE POLICY mp_waitlist_insert_service ON mp_waitlist_entries FOR INSERT WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'mp_waitlist_update_service' AND tablename = 'mp_waitlist_entries') THEN
    CREATE POLICY mp_waitlist_update_service ON mp_waitlist_entries FOR UPDATE USING (auth.role() = 'service_role');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'mp_email_logs_insert_service' AND tablename = 'mp_email_logs') THEN
    CREATE POLICY mp_email_logs_insert_service ON mp_email_logs FOR INSERT WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'mp_email_logs_select_service' AND tablename = 'mp_email_logs') THEN
    CREATE POLICY mp_email_logs_select_service ON mp_email_logs FOR SELECT USING (auth.role() = 'service_role');
  END IF;
END $$;

INSERT INTO storage.buckets (id, name, public) VALUES
  ('template-images', 'template-images', false),
  ('landing-page-assets', 'landing-page-assets', false)
ON CONFLICT (id) DO NOTHING;
