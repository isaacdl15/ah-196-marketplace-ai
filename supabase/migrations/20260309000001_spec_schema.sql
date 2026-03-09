-- ============================================================
-- 0. Admin helper function for RLS
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean, false);
$$;

-- ============================================================
-- 1. athletes
-- ============================================================
CREATE TABLE IF NOT EXISTS athletes (
  id                  UUID PRIMARY KEY,
  sport80_uuid        UUID UNIQUE NOT NULL,
  first_name          VARCHAR(100) NOT NULL,
  last_name           VARCHAR(100) NOT NULL,
  dob                 DATE,
  gender              CHAR(1),
  state               VARCHAR(2),
  club_name           VARCHAR(200),
  club_uuid           UUID,
  membership_number   VARCHAR(50),
  membership_valid    BOOLEAN DEFAULT false,
  membership_expiry   DATE,
  belt_rank           VARCHAR(50),
  age_division        VARCHAR(50),
  img_url             TEXT,
  last_synced_at      TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_athletes_last_name ON athletes (last_name);
CREATE INDEX IF NOT EXISTS idx_athletes_state ON athletes (state);
CREATE INDEX IF NOT EXISTS idx_athletes_sport80_uuid ON athletes (sport80_uuid);

-- ============================================================
-- 2. events
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
  id                  UUID PRIMARY KEY,
  sport80_uuid        UUID UNIQUE NOT NULL,
  name                VARCHAR(300) NOT NULL,
  event_type          VARCHAR(100),
  event_subtype       VARCHAR(100),
  grade               INTEGER,
  grade_tier          VARCHAR(20),
  start_date          DATE,
  end_date            DATE,
  status              VARCHAR(20) DEFAULT 'ACTIVE',
  is_mandatory        BOOLEAN DEFAULT false,
  location_state      VARCHAR(2),
  location_city       VARCHAR(100),
  last_synced_at      TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_start_date ON events (start_date);
CREATE INDEX IF NOT EXISTS idx_events_grade_tier ON events (grade_tier);
CREATE INDEX IF NOT EXISTS idx_events_sport80_uuid ON events (sport80_uuid);

-- ============================================================
-- 3. event_registrations
-- ============================================================
CREATE TABLE IF NOT EXISTS event_registrations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  athlete_id      UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  stage_uuid      UUID,
  division_name   VARCHAR(100),
  age_class       VARCHAR(50),
  registered_at   TIMESTAMPTZ,
  UNIQUE (event_id, athlete_id, stage_uuid)
);

CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations (event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_athlete_id ON event_registrations (athlete_id);

-- ============================================================
-- 4. csv_uploads
-- ============================================================
CREATE TABLE IF NOT EXISTS csv_uploads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename        VARCHAR(255) NOT NULL,
  storage_path    TEXT NOT NULL,
  event_id        UUID REFERENCES events(id),
  status          VARCHAR(20) DEFAULT 'UPLOADED',
  total_rows      INTEGER,
  parsed_count    INTEGER,
  error_count     INTEGER,
  error_details   JSONB,
  uploaded_by     UUID,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_csv_uploads_event_id ON csv_uploads (event_id);
CREATE INDEX IF NOT EXISTS idx_csv_uploads_status ON csv_uploads (status);

-- ============================================================
-- 5. match_results
-- ============================================================
CREATE TABLE IF NOT EXISTS match_results (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id                UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  upload_id               UUID REFERENCES csv_uploads(id),
  daedo_match_number      INTEGER,
  phase_name              VARCHAR(50),
  division_name           VARCHAR(100),
  age_category            VARCHAR(50),
  gender                  CHAR(1),
  blue_athlete_id         UUID REFERENCES athletes(id),
  blue_athlete_raw_name   VARCHAR(200),
  blue_athlete_wtf_id     VARCHAR(50),
  blue_athlete_state      VARCHAR(10),
  red_athlete_id          UUID REFERENCES athletes(id),
  red_athlete_raw_name    VARCHAR(200),
  red_athlete_wtf_id      VARCHAR(50),
  red_athlete_state       VARCHAR(10),
  winner                  VARCHAR(4),
  win_method              VARCHAR(20),
  score                   VARCHAR(20),
  match_start_time        TIMESTAMPTZ,
  resolution_status       VARCHAR(20) DEFAULT 'UNRESOLVED',
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_match_results_event_id ON match_results (event_id);
CREATE INDEX IF NOT EXISTS idx_match_results_resolution_status ON match_results (resolution_status);
CREATE INDEX IF NOT EXISTS idx_match_results_blue_athlete_id ON match_results (blue_athlete_id);
CREATE INDEX IF NOT EXISTS idx_match_results_red_athlete_id ON match_results (red_athlete_id);

-- ============================================================
-- 6. identity_mappings
-- ============================================================
CREATE TABLE IF NOT EXISTS identity_mappings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daedo_name          VARCHAR(200) NOT NULL,
  daedo_wtf_id        VARCHAR(50),
  daedo_state         VARCHAR(10),
  athlete_id          UUID NOT NULL REFERENCES athletes(id),
  confidence          DECIMAL(3,2),
  resolution_method   VARCHAR(20),
  resolved_by         VARCHAR(100),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (daedo_name, daedo_state)
);

CREATE INDEX IF NOT EXISTS idx_identity_mappings_daedo_wtf_id ON identity_mappings (daedo_wtf_id);
CREATE INDEX IF NOT EXISTS idx_identity_mappings_athlete_id ON identity_mappings (athlete_id);

-- ============================================================
-- 7. athlete_results
-- ============================================================
CREATE TABLE IF NOT EXISTS athlete_results (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id            UUID NOT NULL REFERENCES athletes(id),
  event_id              UUID NOT NULL REFERENCES events(id),
  division_name         VARCHAR(100) NOT NULL,
  age_category          VARCHAR(50),
  gender                CHAR(1),
  placement             INTEGER,
  bracket_size          INTEGER,
  bracket_modifier      DECIMAL(4,2),
  placement_multiplier  DECIMAL(10,5),
  event_grade           INTEGER,
  grade_tier            VARCHAR(20),
  raw_points            DECIMAL(10,2),
  is_active             BOOLEAN DEFAULT true,
  is_counted            BOOLEAN DEFAULT true,
  is_carried_over       BOOLEAN DEFAULT false,
  carryover_multiplier  DECIMAL(4,2) DEFAULT 1.00,
  effective_points      DECIMAL(10,2),
  event_date            DATE NOT NULL,
  expires_at            DATE,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (athlete_id, event_id, division_name, age_category)
);

CREATE INDEX IF NOT EXISTS idx_athlete_results_athlete_id ON athlete_results (athlete_id);
CREATE INDEX IF NOT EXISTS idx_athlete_results_event_id ON athlete_results (event_id);
CREATE INDEX IF NOT EXISTS idx_athlete_results_event_date ON athlete_results (event_date);
CREATE INDEX IF NOT EXISTS idx_athlete_results_grade_tier ON athlete_results (grade_tier);

-- ============================================================
-- 8. waivers
-- ============================================================
CREATE TABLE IF NOT EXISTS waivers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id      UUID NOT NULL REFERENCES athletes(id),
  event_id        UUID NOT NULL REFERENCES events(id),
  waiver_type     VARCHAR(30) NOT NULL,
  reason          TEXT,
  documentation   TEXT,
  created_by      UUID NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (athlete_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_waivers_athlete_id ON waivers (athlete_id);
CREATE INDEX IF NOT EXISTS idx_waivers_event_id ON waivers (event_id);

-- ============================================================
-- 9. rankings
-- ============================================================
CREATE TABLE IF NOT EXISTS rankings (
  athlete_id              UUID NOT NULL REFERENCES athletes(id),
  division                VARCHAR(100) NOT NULL,
  age_category            VARCHAR(50) NOT NULL,
  gender                  CHAR(1) NOT NULL,
  rank                    INTEGER,
  total_points            DECIMAL(10,2),
  events_counted          INTEGER,
  athlete_name            VARCHAR(200),
  state                   VARCHAR(2),
  club                    VARCHAR(200),
  qualification_method    VARCHAR(100),
  is_qualified            BOOLEAN DEFAULT false,
  last_calculated_at      TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (athlete_id, division, age_category, gender)
);

CREATE INDEX IF NOT EXISTS idx_rankings_division ON rankings (division);
CREATE INDEX IF NOT EXISTS idx_rankings_age_category ON rankings (age_category);
CREATE INDEX IF NOT EXISTS idx_rankings_gender ON rankings (gender);
CREATE INDEX IF NOT EXISTS idx_rankings_rank ON rankings (rank);
CREATE INDEX IF NOT EXISTS idx_rankings_state ON rankings (state);
CREATE INDEX IF NOT EXISTS idx_rankings_total_points ON rankings (total_points DESC);

-- ============================================================
-- 10. Storage buckets
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES
  ('daedo-csvs',   'daedo-csvs',   false),
  ('waiver-docs',  'waiver-docs',  false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 11. RLS
-- ============================================================
ALTER TABLE athletes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE events               ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE csv_uploads          ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_results        ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity_mappings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_results      ENABLE ROW LEVEL SECURITY;
ALTER TABLE waivers              ENABLE ROW LEVEL SECURITY;
ALTER TABLE rankings             ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_athletes"            ON athletes            FOR SELECT USING (true);
CREATE POLICY "public_read_events"              ON events              FOR SELECT USING (true);
CREATE POLICY "public_read_event_registrations" ON event_registrations FOR SELECT USING (true);
CREATE POLICY "public_read_rankings"            ON rankings            FOR SELECT USING (true);

CREATE POLICY "admin_all_athletes"             ON athletes             FOR ALL USING (is_admin());
CREATE POLICY "admin_all_events"               ON events               FOR ALL USING (is_admin());
CREATE POLICY "admin_all_event_registrations"  ON event_registrations  FOR ALL USING (is_admin());
CREATE POLICY "admin_all_csv_uploads"          ON csv_uploads          FOR ALL USING (is_admin());
CREATE POLICY "admin_all_match_results"        ON match_results        FOR ALL USING (is_admin());
CREATE POLICY "admin_all_identity_mappings"    ON identity_mappings    FOR ALL USING (is_admin());
CREATE POLICY "admin_all_athlete_results"      ON athlete_results      FOR ALL USING (is_admin());
CREATE POLICY "admin_all_waivers"              ON waivers              FOR ALL USING (is_admin());
CREATE POLICY "admin_all_rankings"             ON rankings             FOR ALL USING (is_admin());

CREATE POLICY "admin_csv_uploads_storage" ON storage.objects FOR ALL
  USING (bucket_id = 'daedo-csvs' AND is_admin());
CREATE POLICY "admin_waiver_docs_storage" ON storage.objects FOR ALL
  USING (bucket_id = 'waiver-docs' AND is_admin());
