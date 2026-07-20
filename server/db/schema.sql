-- Izzy Signature Database Schema (PostgreSQL for Supabase)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table with courier integration
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_code TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  address TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  mobile_number2 TEXT,
  size TEXT NOT NULL CHECK(size IN ('XS','S','M','L','XL','XXL')),
  colour TEXT NOT NULL,
  notes TEXT,
  amount DECIMAL(10,2) DEFAULT 3500.00,
  status TEXT NOT NULL DEFAULT 'pending'
         CHECK(status IN ('pending','confirmed','no_answer','rejected','packing','ready_for_courier','sent_to_courier','processing','in_transit','out_for_delivery','delivered','returned','cancelled')),
  courier_status TEXT,
  waybill_id TEXT,
  province TEXT,
  district TEXT,
  city TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courier shipments table
CREATE TABLE IF NOT EXISTS courier_shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  courier_name TEXT NOT NULL DEFAULT 'Trans Express',
  waybill_id TEXT,
  tracking_status TEXT,
  api_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  province TEXT NOT NULL,
  district TEXT NOT NULL,
  city TEXT NOT NULL,
  province_id INTEGER,
  district_id INTEGER,
  city_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(province, district, city)
);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at on orders
DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-update updated_at on courier_shipments
DROP TRIGGER IF EXISTS courier_shipments_updated_at ON courier_shipments;
CREATE TRIGGER courier_shipments_updated_at
  BEFORE UPDATE ON courier_shipments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_courier_status ON orders(courier_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_code ON orders(order_code);
CREATE INDEX IF NOT EXISTS idx_orders_mobile_number ON orders(mobile_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_waybill ON orders(waybill_id);

CREATE INDEX IF NOT EXISTS idx_courier_shipments_order_id ON courier_shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_courier_shipments_waybill ON courier_shipments(waybill_id);
CREATE INDEX IF NOT EXISTS idx_courier_shipments_status ON courier_shipments(tracking_status);

CREATE INDEX IF NOT EXISTS idx_locations_province ON locations(province);
CREATE INDEX IF NOT EXISTS idx_locations_district ON locations(district);

-- Update existing orders to use new status values
UPDATE orders SET status = 'rejected' WHERE status = 'cancelled';
UPDATE orders SET status = 'confirmed' WHERE status IN ('shipped', 'delivered');
