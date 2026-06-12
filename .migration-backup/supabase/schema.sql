-- Estavo App Database Schema
-- Run this in your Supabase SQL editor (estavo-app project)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CORE TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS estates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  unit_count INT DEFAULT 0,
  subscription_tier TEXT DEFAULT 'starter' CHECK (subscription_tier IN ('starter', 'growth', 'estate', 'enterprise')),
  is_active BOOLEAN DEFAULT true,
  gates JSONB DEFAULT '[]',
  guest_code_config JSONB DEFAULT '{"max_active_codes_per_unit": 5, "default_uses_total": 2, "parcel_uses_total": 1}',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
  unit_number TEXT NOT NULL,
  status TEXT DEFAULT 'occupied' CHECK (status IN ('occupied', 'vacant')),
  unit_type TEXT DEFAULT 'owner' CHECK (unit_type IN ('owner', 'tenant')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(estate_id, unit_number)
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  estate_id UUID REFERENCES estates(id),
  unit_id UUID REFERENCES units(id),
  role TEXT NOT NULL CHECK (role IN ('resident', 'security', 'estate_manager', 'trustee', 'super_admin')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- GATE & GUEST ACCESS
-- ============================================================

CREATE TABLE IF NOT EXISTS guest_otps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES units(id),
  resident_id UUID REFERENCES profiles(id),
  otp_code TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  guest_phone TEXT,
  is_parcel BOOLEAN DEFAULT false,
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ NOT NULL,
  uses_total INT DEFAULT 2,
  uses_remaining INT DEFAULT 2,
  revoked_at TIMESTAMPTZ,
  deactivated_at TIMESTAMPTZ,
  deactivated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gate_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
  gate_id TEXT,
  gate_label TEXT,
  direction TEXT DEFAULT 'entry' CHECK (direction IN ('entry', 'exit')),
  entry_type TEXT DEFAULT 'resident' CHECK (entry_type IN ('resident', 'otp', 'manual', 'permanent')),
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failed', 'cancelled')),
  guest_name TEXT,
  unit_id UUID REFERENCES units(id),
  staff_id UUID REFERENCES profiles(id),
  otp_id UUID REFERENCES guest_otps(id),
  hardware_response_ms INT,
  entered_at TIMESTAMPTZ DEFAULT now(),
  exited_at TIMESTAMPTZ
);

-- ============================================================
-- MAINTENANCE REQUESTS
-- ============================================================

CREATE TABLE IF NOT EXISTS maintenance_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES units(id),
  submitted_by UUID REFERENCES profiles(id),
  ticket_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('maintenance', 'security', 'urgent', 'general')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_to TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  UNIQUE(estate_id, ticket_number)
);

-- ============================================================
-- INCIDENTS (EMERGENCY ALERTS)
-- ============================================================

CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES units(id),
  reported_by UUID REFERENCES profiles(id),
  reporter_name TEXT,
  incident_type TEXT NOT NULL,
  description TEXT,
  emergency_ref TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved')),
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- ============================================================
-- NOTICES / BROADCASTS
-- ============================================================

CREATE TABLE IF NOT EXISTS notices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'urgent', 'emergency')),
  attachment_url TEXT,
  published_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS broadcast_reads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notice_id UUID NOT NULL REFERENCES notices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(notice_id, user_id)
);

-- ============================================================
-- COMMUNITY POSTS & EVENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id),
  author_name TEXT,
  content TEXT NOT NULL,
  post_type TEXT DEFAULT 'general',
  is_anonymous BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS community_post_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reaction_type TEXT DEFAULT 'like',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id, reaction_type)
);

CREATE TABLE IF NOT EXISTS community_post_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id),
  author_name TEXT,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS community_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS event_rsvps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES community_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  response TEXT NOT NULL CHECK (response IN ('yes', 'no', 'maybe')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- ============================================================
-- AMENITIES & BOOKINGS
-- ============================================================

CREATE TABLE IF NOT EXISTS amenities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  available_days TEXT[] DEFAULT ARRAY['monday','tuesday','wednesday','thursday','friday','saturday','sunday'],
  available_from TIME DEFAULT '07:00',
  available_until TIME DEFAULT '22:00',
  slot_duration_mins INT DEFAULT 60,
  max_bookings_per_slot INT DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS amenity_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
  amenity_id UUID NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES units(id),
  slot_start TIMESTAMPTZ NOT NULL,
  slot_end TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- CONTRACTORS
-- ============================================================

CREATE TABLE IF NOT EXISTS contractors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trade_categories TEXT[] DEFAULT ARRAY[]::TEXT[],
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  rating DECIMAL(3,2),
  job_count INT DEFAULT 0,
  avg_response_mins INT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- LEVY ACCOUNTS & TRANSACTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS levy_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  balance DECIMAL(12,2) DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT now(),
  UNIQUE(estate_id, unit_id)
);

CREATE TABLE IF NOT EXISTS levy_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('charge', 'payment', 'credit', 'penalty')),
  amount DECIMAL(12,2) NOT NULL,
  description TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- RLS POLICIES
-- ============================================================

ALTER TABLE estates ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE gate_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenity_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE levy_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE levy_transactions ENABLE ROW LEVEL SECURITY;

-- Residents can read their own estate
CREATE POLICY "estate_read" ON estates FOR SELECT
  USING (id IN (SELECT estate_id FROM profiles WHERE id = auth.uid()));

-- Profiles: users see own estate
CREATE POLICY "profiles_read" ON profiles FOR SELECT
  USING (estate_id IN (SELECT estate_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Units: estate members
CREATE POLICY "units_read" ON units FOR SELECT
  USING (estate_id IN (SELECT estate_id FROM profiles WHERE id = auth.uid()));

-- Guest OTPs: residents see own unit's codes
CREATE POLICY "guest_otps_read" ON guest_otps FOR SELECT
  USING (unit_id IN (SELECT unit_id FROM profiles WHERE id = auth.uid() AND unit_id IS NOT NULL));

CREATE POLICY "guest_otps_insert" ON guest_otps FOR INSERT
  WITH CHECK (unit_id IN (SELECT unit_id FROM profiles WHERE id = auth.uid() AND unit_id IS NOT NULL));

CREATE POLICY "guest_otps_update" ON guest_otps FOR UPDATE
  USING (unit_id IN (SELECT unit_id FROM profiles WHERE id = auth.uid() AND unit_id IS NOT NULL));

-- Gate log
CREATE POLICY "gate_log_read_resident" ON gate_log FOR SELECT
  USING (estate_id IN (SELECT estate_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "gate_log_insert" ON gate_log FOR INSERT
  WITH CHECK (estate_id IN (SELECT estate_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "gate_log_update_own" ON gate_log FOR UPDATE
  USING (estate_id IN (SELECT estate_id FROM profiles WHERE id = auth.uid()));

-- Maintenance requests
CREATE POLICY "maintenance_read" ON maintenance_requests FOR SELECT
  USING (estate_id IN (SELECT estate_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "maintenance_insert" ON maintenance_requests FOR INSERT
  WITH CHECK (estate_id IN (SELECT estate_id FROM profiles WHERE id = auth.uid()));

-- Incidents
CREATE POLICY "incidents_insert" ON incidents FOR INSERT
  WITH CHECK (estate_id IN (SELECT estate_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "incidents_read" ON incidents FOR SELECT
  USING (estate_id IN (SELECT estate_id FROM profiles WHERE id = auth.uid()));

-- Notices
CREATE POLICY "notices_read" ON notices FOR SELECT
  USING (estate_id IN (SELECT estate_id FROM profiles WHERE id = auth.uid()));

-- Broadcast reads
CREATE POLICY "broadcast_reads_read" ON broadcast_reads FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "broadcast_reads_insert" ON broadcast_reads FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Community posts
CREATE POLICY "posts_read" ON community_posts FOR SELECT
  USING (estate_id IN (SELECT estate_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "posts_insert" ON community_posts FOR INSERT
  WITH CHECK (estate_id IN (SELECT estate_id FROM profiles WHERE id = auth.uid()));

-- Post reactions
CREATE POLICY "reactions_all" ON community_post_reactions FOR ALL
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Post comments
CREATE POLICY "comments_read" ON community_post_comments FOR SELECT
  USING (post_id IN (SELECT id FROM community_posts WHERE estate_id IN (SELECT estate_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY "comments_insert" ON community_post_comments FOR INSERT
  WITH CHECK (author_id = auth.uid());

-- Events
CREATE POLICY "events_read" ON community_events FOR SELECT
  USING (estate_id IN (SELECT estate_id FROM profiles WHERE id = auth.uid()));

-- RSVPs
CREATE POLICY "rsvps_all" ON event_rsvps FOR ALL
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Amenities
CREATE POLICY "amenities_read" ON amenities FOR SELECT
  USING (estate_id IN (SELECT estate_id FROM profiles WHERE id = auth.uid()));

-- Amenity bookings
CREATE POLICY "bookings_read" ON amenity_bookings FOR SELECT
  USING (user_id = auth.uid() OR estate_id IN (
    SELECT estate_id FROM profiles WHERE id = auth.uid() AND role IN ('estate_manager', 'super_admin')
  ));

CREATE POLICY "bookings_insert" ON amenity_bookings FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "bookings_update_own" ON amenity_bookings FOR UPDATE
  USING (user_id = auth.uid());

-- Contractors
CREATE POLICY "contractors_read" ON contractors FOR SELECT
  USING (estate_id IN (SELECT estate_id FROM profiles WHERE id = auth.uid()));

-- Levy accounts
CREATE POLICY "levy_accounts_read" ON levy_accounts FOR SELECT
  USING (unit_id IN (SELECT unit_id FROM profiles WHERE id = auth.uid() AND unit_id IS NOT NULL)
    OR estate_id IN (SELECT estate_id FROM profiles WHERE id = auth.uid() AND role IN ('estate_manager', 'trustee', 'super_admin')));

-- Levy transactions
CREATE POLICY "levy_transactions_read" ON levy_transactions FOR SELECT
  USING (unit_id IN (SELECT unit_id FROM profiles WHERE id = auth.uid() AND unit_id IS NOT NULL)
    OR estate_id IN (SELECT estate_id FROM profiles WHERE id = auth.uid() AND role IN ('estate_manager', 'trustee', 'super_admin')));

-- ============================================================
-- SEED: Demo estate with gates
-- (Run manually only for dev/demo purposes)
-- ============================================================
-- INSERT INTO estates (name, address, unit_count, gates) VALUES (
--   'Hillcrest Estate',
--   '14 Hillcrest Drive, Hillcrest, KZN',
--   136,
--   '[{"id":"main","label":"Main Entry Gate"},{"id":"exit","label":"Exit Gate"}]'
-- );
