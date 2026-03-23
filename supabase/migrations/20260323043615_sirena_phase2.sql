-- ============================================================
-- Sirena Phase 2 — Creator Dashboard & Monetization Platform
-- Issue #528 | Submission: da14c9c7-80c6-41b5-9dc5-a01eafb3b2c7
-- All tables prefixed with sirena_ (shared Supabase project)
-- Phase 1 tables (sirena_waitlist, sirena_niche_tags, sirena_niche_enum) assumed to exist
-- ============================================================

-- Creator plan enum
DO $$ BEGIN
  CREATE TYPE sirena_creator_plan AS ENUM ('free', 'pro');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Product type enum
DO $$ BEGIN
  CREATE TYPE sirena_product_type AS ENUM ('pdf', 'video', 'audio', 'bundle', 'course', 'preset');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Product status enum
DO $$ BEGIN
  CREATE TYPE sirena_product_status AS ENUM ('draft', 'active', 'paused');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Sale status enum
DO $$ BEGIN
  CREATE TYPE sirena_sale_status AS ENUM ('completed', 'pending', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Payout status enum
DO $$ BEGIN
  CREATE TYPE sirena_payout_status AS ENUM ('requested', 'processing', 'paid', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- CORE TABLES
-- ============================================================

-- Creator profiles (linked to auth.users)
-- NOTE: has sirena_handle_new_creator trigger — use upsert in profile routes
CREATE TABLE IF NOT EXISTS sirena_creators (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username            TEXT UNIQUE NOT NULL,
  display_name        TEXT NOT NULL,
  bio                 TEXT,
  niche               TEXT,
  avatar_url          TEXT,
  locale              TEXT NOT NULL DEFAULT 'en' CHECK (locale IN ('en', 'es')),
  plan                sirena_creator_plan NOT NULL DEFAULT 'free',
  page_theme_color    TEXT NOT NULL DEFAULT '#C75B40',
  page_bg             TEXT NOT NULL DEFAULT 'warm-cream',
  page_font           TEXT NOT NULL DEFAULT 'plus-jakarta-sans',
  page_link_text      TEXT,
  share_enabled       BOOLEAN NOT NULL DEFAULT true,
  payout_email        TEXT,
  payout_threshold    INT NOT NULL DEFAULT 25,
  stripe_account_id   TEXT,
  is_admin            BOOLEAN NOT NULL DEFAULT false,
  onboarding_done     BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Creator links (link-in-bio)
CREATE TABLE IF NOT EXISTS sirena_links (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id      UUID NOT NULL REFERENCES sirena_creators(id) ON DELETE CASCADE,
  link_type       TEXT NOT NULL DEFAULT 'link' CHECK (link_type IN ('link','instagram','youtube','tiktok','email','other')),
  title           TEXT NOT NULL,
  url             TEXT NOT NULL,
  visible         BOOLEAN NOT NULL DEFAULT true,
  show_thumbnail  BOOLEAN NOT NULL DEFAULT false,
  position        INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Digital products
CREATE TABLE IF NOT EXISTS sirena_products (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id        UUID NOT NULL REFERENCES sirena_creators(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  description       TEXT,
  product_type      sirena_product_type NOT NULL DEFAULT 'pdf',
  price_cents       INT NOT NULL DEFAULT 0,
  is_free           BOOLEAN NOT NULL DEFAULT false,
  access            TEXT NOT NULL DEFAULT 'everyone' CHECK (access IN ('everyone','subscribers')),
  status            sirena_product_status NOT NULL DEFAULT 'draft',
  cover_image_url   TEXT,
  file_url          TEXT,
  stripe_product_id TEXT,
  stripe_price_id   TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sales / purchases
CREATE TABLE IF NOT EXISTS sirena_sales (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id                  UUID NOT NULL REFERENCES sirena_creators(id) ON DELETE CASCADE,
  product_id                  UUID REFERENCES sirena_products(id) ON DELETE SET NULL,
  customer_email              TEXT NOT NULL,
  amount_cents                INT NOT NULL DEFAULT 0,
  platform_fee_cents          INT NOT NULL DEFAULT 0,
  net_cents                   INT NOT NULL DEFAULT 0,
  status                      sirena_sale_status NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id    TEXT,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payout requests
CREATE TABLE IF NOT EXISTS sirena_payouts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id      UUID NOT NULL REFERENCES sirena_creators(id) ON DELETE CASCADE,
  amount_cents    INT NOT NULL,
  payout_email    TEXT NOT NULL,
  status          sirena_payout_status NOT NULL DEFAULT 'requested',
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at    TIMESTAMPTZ
);

-- Page view events (analytics)
CREATE TABLE IF NOT EXISTS sirena_page_views (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id  UUID NOT NULL REFERENCES sirena_creators(id) ON DELETE CASCADE,
  visitor_id  TEXT,
  ip_country  TEXT,
  referrer    TEXT,
  utm_source  TEXT,
  utm_medium  TEXT,
  utm_campaign TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Link click events (analytics)
CREATE TABLE IF NOT EXISTS sirena_link_clicks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id  UUID NOT NULL REFERENCES sirena_creators(id) ON DELETE CASCADE,
  link_id     UUID REFERENCES sirena_links(id) ON DELETE SET NULL,
  visitor_id  TEXT,
  ip_country  TEXT,
  referrer    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notification preferences
CREATE TABLE IF NOT EXISTS sirena_notification_prefs (
  creator_id        UUID PRIMARY KEY REFERENCES sirena_creators(id) ON DELETE CASCADE,
  new_sale          BOOLEAN NOT NULL DEFAULT true,
  payout_processed  BOOLEAN NOT NULL DEFAULT true,
  new_follower      BOOLEAN NOT NULL DEFAULT true,
  monthly_summary   BOOLEAN NOT NULL DEFAULT true,
  tips_updates      BOOLEAN NOT NULL DEFAULT false
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS sirena_links_creator_idx       ON sirena_links (creator_id, position);
CREATE INDEX IF NOT EXISTS sirena_products_creator_idx    ON sirena_products (creator_id, status);
CREATE INDEX IF NOT EXISTS sirena_sales_creator_idx       ON sirena_sales (creator_id, created_at DESC);
CREATE INDEX IF NOT EXISTS sirena_payouts_creator_idx     ON sirena_payouts (creator_id, created_at DESC);
CREATE INDEX IF NOT EXISTS sirena_page_views_creator_idx  ON sirena_page_views (creator_id, created_at DESC);
CREATE INDEX IF NOT EXISTS sirena_link_clicks_creator_idx ON sirena_link_clicks (creator_id, created_at DESC);
CREATE INDEX IF NOT EXISTS sirena_creators_username_idx   ON sirena_creators (username);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public) VALUES
  ('sirena-avatars', 'sirena-avatars', true),
  ('sirena-covers',  'sirena-covers',  true),
  ('sirena-products','sirena-products', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- sirena_creators
ALTER TABLE sirena_creators ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sirena_creators_public_read" ON sirena_creators;
DROP POLICY IF EXISTS "sirena_creators_self_write"  ON sirena_creators;
DROP POLICY IF EXISTS "sirena_creators_service"     ON sirena_creators;
CREATE POLICY "sirena_creators_public_read" ON sirena_creators FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "sirena_creators_self_write"  ON sirena_creators FOR ALL    TO authenticated      USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "sirena_creators_service"     ON sirena_creators FOR ALL    TO service_role        USING (true) WITH CHECK (true);

-- sirena_links
ALTER TABLE sirena_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sirena_links_public_read"  ON sirena_links;
DROP POLICY IF EXISTS "sirena_links_creator_all"  ON sirena_links;
DROP POLICY IF EXISTS "sirena_links_service"      ON sirena_links;
CREATE POLICY "sirena_links_public_read" ON sirena_links FOR SELECT TO anon, authenticated USING (visible = true);
CREATE POLICY "sirena_links_creator_all" ON sirena_links FOR ALL    TO authenticated      USING (creator_id = auth.uid()) WITH CHECK (creator_id = auth.uid());
CREATE POLICY "sirena_links_service"     ON sirena_links FOR ALL    TO service_role        USING (true) WITH CHECK (true);

-- sirena_products
ALTER TABLE sirena_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sirena_products_public_active" ON sirena_products;
DROP POLICY IF EXISTS "sirena_products_creator_all"   ON sirena_products;
DROP POLICY IF EXISTS "sirena_products_service"       ON sirena_products;
CREATE POLICY "sirena_products_public_active" ON sirena_products FOR SELECT TO anon, authenticated USING (status = 'active');
CREATE POLICY "sirena_products_creator_all"   ON sirena_products FOR ALL    TO authenticated      USING (creator_id = auth.uid()) WITH CHECK (creator_id = auth.uid());
CREATE POLICY "sirena_products_service"       ON sirena_products FOR ALL    TO service_role        USING (true) WITH CHECK (true);

-- sirena_sales
ALTER TABLE sirena_sales ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sirena_sales_creator_read" ON sirena_sales;
DROP POLICY IF EXISTS "sirena_sales_service"      ON sirena_sales;
CREATE POLICY "sirena_sales_creator_read" ON sirena_sales FOR SELECT TO authenticated USING (creator_id = auth.uid());
CREATE POLICY "sirena_sales_service"      ON sirena_sales FOR ALL    TO service_role   USING (true) WITH CHECK (true);

-- sirena_payouts
ALTER TABLE sirena_payouts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sirena_payouts_creator_read"   ON sirena_payouts;
DROP POLICY IF EXISTS "sirena_payouts_creator_insert" ON sirena_payouts;
DROP POLICY IF EXISTS "sirena_payouts_service"        ON sirena_payouts;
CREATE POLICY "sirena_payouts_creator_read"   ON sirena_payouts FOR SELECT TO authenticated USING (creator_id = auth.uid());
CREATE POLICY "sirena_payouts_creator_insert" ON sirena_payouts FOR INSERT TO authenticated WITH CHECK (creator_id = auth.uid());
CREATE POLICY "sirena_payouts_service"        ON sirena_payouts FOR ALL    TO service_role   USING (true) WITH CHECK (true);

-- sirena_page_views
ALTER TABLE sirena_page_views ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sirena_pv_anon_insert"    ON sirena_page_views;
DROP POLICY IF EXISTS "sirena_pv_creator_read"   ON sirena_page_views;
DROP POLICY IF EXISTS "sirena_pv_service"        ON sirena_page_views;
CREATE POLICY "sirena_pv_anon_insert"  ON sirena_page_views FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "sirena_pv_creator_read" ON sirena_page_views FOR SELECT TO authenticated       USING (creator_id = auth.uid());
CREATE POLICY "sirena_pv_service"      ON sirena_page_views FOR ALL    TO service_role         USING (true) WITH CHECK (true);

-- sirena_link_clicks
ALTER TABLE sirena_link_clicks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sirena_lc_anon_insert"  ON sirena_link_clicks;
DROP POLICY IF EXISTS "sirena_lc_creator_read" ON sirena_link_clicks;
DROP POLICY IF EXISTS "sirena_lc_service"      ON sirena_link_clicks;
CREATE POLICY "sirena_lc_anon_insert"  ON sirena_link_clicks FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "sirena_lc_creator_read" ON sirena_link_clicks FOR SELECT TO authenticated       USING (creator_id = auth.uid());
CREATE POLICY "sirena_lc_service"      ON sirena_link_clicks FOR ALL    TO service_role         USING (true) WITH CHECK (true);

-- sirena_notification_prefs
ALTER TABLE sirena_notification_prefs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sirena_notif_creator_all" ON sirena_notification_prefs;
DROP POLICY IF EXISTS "sirena_notif_service"     ON sirena_notification_prefs;
CREATE POLICY "sirena_notif_creator_all" ON sirena_notification_prefs FOR ALL TO authenticated USING (creator_id = auth.uid()) WITH CHECK (creator_id = auth.uid());
CREATE POLICY "sirena_notif_service"     ON sirena_notification_prefs FOR ALL TO service_role   USING (true) WITH CHECK (true);

-- Storage bucket policies
DROP POLICY IF EXISTS "sirena_avatars_public_read"  ON storage.objects;
DROP POLICY IF EXISTS "sirena_avatars_auth_upload"  ON storage.objects;
DROP POLICY IF EXISTS "sirena_covers_public_read"   ON storage.objects;
DROP POLICY IF EXISTS "sirena_covers_auth_upload"   ON storage.objects;
DROP POLICY IF EXISTS "sirena_prods_creator_read"   ON storage.objects;
DROP POLICY IF EXISTS "sirena_prods_auth_upload"    ON storage.objects;

CREATE POLICY "sirena_avatars_public_read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'sirena-avatars');
CREATE POLICY "sirena_avatars_auth_upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'sirena-avatars');
CREATE POLICY "sirena_covers_public_read"  ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'sirena-covers');
CREATE POLICY "sirena_covers_auth_upload"  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'sirena-covers');
CREATE POLICY "sirena_prods_creator_read"  ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'sirena-products');
CREATE POLICY "sirena_prods_auth_upload"   ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'sirena-products');

-- ============================================================
-- FUNCTION: auto-create creator profile on auth signup
-- ============================================================

CREATE OR REPLACE FUNCTION sirena_handle_new_creator()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  suffix INT := 0;
BEGIN
  base_username := LOWER(REGEXP_REPLACE(SPLIT_PART(NEW.email, '@', 1), '[^a-z0-9]', '', 'g'));
  IF LENGTH(base_username) < 3 THEN base_username := 'creator'; END IF;
  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM sirena_creators WHERE username = final_username) LOOP
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  END LOOP;
  INSERT INTO sirena_creators (id, username, display_name, locale)
  VALUES (
    NEW.id,
    final_username,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'locale', 'en')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS sirena_on_auth_user_created ON auth.users;
CREATE TRIGGER sirena_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION sirena_handle_new_creator();
