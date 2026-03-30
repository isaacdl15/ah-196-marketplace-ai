-- Add kyc_status to mp_profiles (Phase 2)
ALTER TABLE mp_profiles ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'pending'
  CHECK (kyc_status IN ('pending', 'approved', 'rejected'));

-- Create mp_email_logs table for audit trail
CREATE TABLE IF NOT EXISTS mp_email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL DEFAULT '',
  email_type TEXT NOT NULL,
  status TEXT DEFAULT 'sent',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE mp_email_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'mp_email_logs_service_only' AND tablename = 'mp_email_logs') THEN
    CREATE POLICY mp_email_logs_service_only ON mp_email_logs
      FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;
