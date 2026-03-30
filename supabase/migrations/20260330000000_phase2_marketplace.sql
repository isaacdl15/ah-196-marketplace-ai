-- Phase 2: Marketplace tables

-- mp_profiles: seller/buyer profiles linked to auth.users
CREATE TABLE IF NOT EXISTS mp_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  username TEXT UNIQUE,
  bio TEXT,
  website TEXT,
  avatar_url TEXT,
  stripe_account_id TEXT,
  stripe_onboarded BOOLEAN DEFAULT FALSE,
  categories TEXT[] DEFAULT '{}',
  is_seller BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS mp_profiles_user_id_idx ON mp_profiles(user_id);
CREATE INDEX IF NOT EXISTS mp_profiles_username_idx ON mp_profiles(username);

-- BUGFIX #198: ON CONFLICT (user_id) requires a UNIQUE constraint on user_id
ALTER TABLE mp_profiles ADD CONSTRAINT mp_profiles_user_id_unique UNIQUE (user_id);

-- mp_templates: marketplace template listings
CREATE TABLE IF NOT EXISTS mp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES mp_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  price_cents INT NOT NULL DEFAULT 0,
  is_free BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'under_review', 'rejected')),
  preview_variation TEXT,
  features TEXT[] DEFAULT '{}',
  tech_stack TEXT[] DEFAULT '{}',
  demo_url TEXT,
  github_url TEXT,
  file_url TEXT,
  preview_images TEXT[] DEFAULT '{}',
  downloads INT NOT NULL DEFAULT 0,
  rating_avg NUMERIC(3,2) DEFAULT 0,
  rating_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS mp_templates_seller_idx ON mp_templates(seller_id);
CREATE INDEX IF NOT EXISTS mp_templates_status_idx ON mp_templates(status);
CREATE INDEX IF NOT EXISTS mp_templates_category_idx ON mp_templates(category);
CREATE INDEX IF NOT EXISTS mp_templates_slug_idx ON mp_templates(slug);

-- mp_purchases: purchase records
CREATE TABLE IF NOT EXISTS mp_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES mp_templates(id) ON DELETE CASCADE,
  amount_cents INT NOT NULL DEFAULT 0,
  stripe_payment_intent_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS mp_purchases_buyer_idx ON mp_purchases(buyer_id);
CREATE INDEX IF NOT EXISTS mp_purchases_template_idx ON mp_purchases(template_id);

-- mp_reviews: template reviews
CREATE TABLE IF NOT EXISTS mp_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES mp_templates(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS mp_reviews_template_idx ON mp_reviews(template_id);
CREATE UNIQUE INDEX IF NOT EXISTS mp_reviews_buyer_template_idx ON mp_reviews(buyer_id, template_id);

-- mp_referrals: referral tracking
CREATE TABLE IF NOT EXISTS mp_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES mp_profiles(id) ON DELETE CASCADE,
  referred_email TEXT NOT NULL,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS mp_referrals_referrer_idx ON mp_referrals(referrer_id);

-- Enable RLS
ALTER TABLE mp_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE mp_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE mp_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE mp_referrals ENABLE ROW LEVEL SECURITY;

-- mp_profiles policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'mp_profiles_public_select' AND tablename = 'mp_profiles') THEN
    CREATE POLICY mp_profiles_public_select ON mp_profiles FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'mp_profiles_insert_service' AND tablename = 'mp_profiles') THEN
    CREATE POLICY mp_profiles_insert_service ON mp_profiles FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'mp_profiles_update_own' AND tablename = 'mp_profiles') THEN
    CREATE POLICY mp_profiles_update_own ON mp_profiles FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role');
  END IF;
END $$;

-- mp_templates policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'mp_templates_public_select' AND tablename = 'mp_templates') THEN
    CREATE POLICY mp_templates_public_select ON mp_templates FOR SELECT USING (status = 'published' OR auth.role() = 'service_role');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'mp_templates_seller_select' AND tablename = 'mp_templates') THEN
    CREATE POLICY mp_templates_seller_select ON mp_templates FOR SELECT USING (
      seller_id IN (SELECT id FROM mp_profiles WHERE user_id = auth.uid())
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'mp_templates_insert_service' AND tablename = 'mp_templates') THEN
    CREATE POLICY mp_templates_insert_service ON mp_templates FOR INSERT WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'mp_templates_update_service' AND tablename = 'mp_templates') THEN
    CREATE POLICY mp_templates_update_service ON mp_templates FOR UPDATE USING (auth.role() = 'service_role');
  END IF;
END $$;

-- mp_purchases policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'mp_purchases_own_select' AND tablename = 'mp_purchases') THEN
    CREATE POLICY mp_purchases_own_select ON mp_purchases FOR SELECT USING (auth.uid() = buyer_id OR auth.role() = 'service_role');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'mp_purchases_insert_service' AND tablename = 'mp_purchases') THEN
    CREATE POLICY mp_purchases_insert_service ON mp_purchases FOR INSERT WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'mp_purchases_update_service' AND tablename = 'mp_purchases') THEN
    CREATE POLICY mp_purchases_update_service ON mp_purchases FOR UPDATE USING (auth.role() = 'service_role');
  END IF;
END $$;

-- mp_reviews policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'mp_reviews_public_select' AND tablename = 'mp_reviews') THEN
    CREATE POLICY mp_reviews_public_select ON mp_reviews FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'mp_reviews_insert_own' AND tablename = 'mp_reviews') THEN
    CREATE POLICY mp_reviews_insert_own ON mp_reviews FOR INSERT WITH CHECK (auth.uid() = buyer_id);
  END IF;
END $$;

-- mp_referrals policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'mp_referrals_public_select' AND tablename = 'mp_referrals') THEN
    CREATE POLICY mp_referrals_public_select ON mp_referrals FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'mp_referrals_insert_service' AND tablename = 'mp_referrals') THEN
    CREATE POLICY mp_referrals_insert_service ON mp_referrals FOR INSERT WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

-- Auto-create mp_profiles on auth.users INSERT
-- BUGFIX #198: Added EXCEPTION handler so trigger errors don't block user creation;
-- added SET search_path = public for security best practice
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uname TEXT;
BEGIN
  -- derive a unique username from email
  uname := split_part(NEW.email, '@', 1);
  -- ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM mp_profiles WHERE username = uname) LOOP
    uname := uname || floor(random() * 1000)::text;
  END LOOP;

  INSERT INTO mp_profiles (user_id, display_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    uname
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'handle_new_user error: % %', SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
