-- Estavo Platform Database Schema
-- Run this in your Supabase SQL editor (estavo-platform project)
-- This is the billing / superadmin project
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS platform_estates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_estate_id UUID NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  unit_count INT DEFAULT 0,
  subscription_tier TEXT DEFAULT 'starter',
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'suspended', 'cancelled', 'pilot')),
  billing_day INT DEFAULT 1,
  monthly_amount_zar DECIMAL(10,2),
  next_invoice_date DATE,
  is_pilot BOOLEAN DEFAULT false,
  pilot_discount_pct INT DEFAULT 0,
  notes TEXT,
  manager_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS superadmin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS billing_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform_estate_id UUID NOT NULL REFERENCES platform_estates(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('invoice_generated', 'payment_received', 'overdue', 'suspended', 'pilot_started')),
  amount_zar DECIMAL(10,2),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform_estate_id UUID REFERENCES platform_estates(id),
  superadmin_id UUID REFERENCES superadmin_profiles(id),
  action TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE platform_estates ENABLE ROW LEVEL SECURITY;
ALTER TABLE superadmin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_logs ENABLE ROW LEVEL SECURITY;

-- Only authenticated superadmins (from this project's auth) can access anything
CREATE POLICY "superadmin_all" ON platform_estates FOR ALL
  USING (auth.uid() IN (SELECT id FROM superadmin_profiles WHERE is_active = true));

CREATE POLICY "superadmin_profiles_all" ON superadmin_profiles FOR ALL
  USING (auth.uid() = id OR auth.uid() IN (SELECT id FROM superadmin_profiles WHERE is_active = true));

CREATE POLICY "billing_events_all" ON billing_events FOR ALL
  USING (auth.uid() IN (SELECT id FROM superadmin_profiles WHERE is_active = true));

CREATE POLICY "support_logs_all" ON support_logs FOR ALL
  USING (auth.uid() IN (SELECT id FROM superadmin_profiles WHERE is_active = true));
