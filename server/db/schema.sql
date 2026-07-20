-- Izzy Signature Database Schema

CREATE TABLE IF NOT EXISTS admin_users (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email       TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE TABLE IF NOT EXISTS orders (
  id             TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  order_code     TEXT NOT NULL UNIQUE,
  customer_name  TEXT NOT NULL,
  address        TEXT NOT NULL,
  mobile_number  TEXT NOT NULL,
  size           TEXT NOT NULL CHECK(size IN ('XS','S','M','L','XL','XXL')),
  colour         TEXT NOT NULL,
  notes          TEXT,
  status         TEXT NOT NULL DEFAULT 'pending'
                   CHECK(status IN ('pending','confirmed','shipped','delivered','cancelled')),
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

-- Auto-update updated_at on status change
CREATE TRIGGER IF NOT EXISTS orders_updated_at
  AFTER UPDATE ON orders
  FOR EACH ROW
BEGIN
  UPDATE orders SET updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
  WHERE id = OLD.id;
END;
