/*
  # Update delivery zones and add customers table

  1. Changes
    - Drop old delivery_areas table
    - Create new delivery_zones table with min/max distance and fees
    - Create new customers table

  2. New Tables
    - delivery_zones
      - id (uuid, primary key)
      - min_distance (numeric)
      - max_distance (numeric)
      - delivery_fee (numeric)
    - customers
      - id (uuid, primary key)
      - phone (text)
      - name (text)
      - address (jsonb)
      - last_order_date (timestamptz)
      - created_at (timestamptz)

  3. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Drop old table
DROP TABLE IF EXISTS delivery_areas;

-- Create new delivery zones table
CREATE TABLE IF NOT EXISTS delivery_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  min_distance numeric NOT NULL DEFAULT 0,
  max_distance numeric NOT NULL DEFAULT 1,
  delivery_fee numeric(8,2) NOT NULL,
  CONSTRAINT min_less_than_max CHECK (min_distance < max_distance)
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL UNIQUE,
  name text NOT NULL,
  address jsonb,
  last_order_date timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Enable read access for authenticated users" ON delivery_zones
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable write access for authenticated users" ON delivery_zones
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable read access for authenticated users" ON customers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable write access for authenticated users" ON customers
  FOR ALL TO authenticated USING (true) WITH CHECK (true);