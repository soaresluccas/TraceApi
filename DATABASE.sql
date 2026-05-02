-- ============================================================================
-- SQL Script for Supabase - Trace Company API
-- ============================================================================
-- Run this script in your Supabase project SQL Editor to create the leads table
-- ============================================================================

-- Create the leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  instagram TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS leads_whatsapp_idx ON leads(whatsapp);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policy for SELECT (public read)
CREATE POLICY "Enable read access for all users" ON leads
  FOR SELECT USING (true);

-- Create policy for INSERT (public insert)
CREATE POLICY "Enable insert for all users" ON leads
  FOR INSERT WITH CHECK (true);

-- Create policy for UPDATE (public update)
CREATE POLICY "Enable update for all users" ON leads
  FOR UPDATE USING (true) WITH CHECK (true);

-- Create policy for DELETE (public delete)
CREATE POLICY "Enable delete for all users" ON leads
  FOR DELETE USING (true);

-- Grant permissions to anon user
GRANT ALL ON leads TO anon;
GRANT ALL ON leads TO authenticated;
