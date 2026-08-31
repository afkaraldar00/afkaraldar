const { execSync } = require('child_process');

console.log("Installing pg package temporarily...");
execSync('npm install pg', { stdio: 'inherit' });

const { Client } = require('pg');

const connectionString = "postgresql://postgres:password@db.dzxgdufdwbjaghuccthn.supabase.co:5432/postgres";

const sql = `
  CREATE TABLE IF NOT EXISTS "Coupon" (
    code TEXT PRIMARY KEY,
    discount TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "Brand" (
    id TEXT PRIMARY KEY,
    name_en TEXT NOT NULL,
    origin TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "Subscriber" (
    email TEXT PRIMARY KEY,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
  );

  -- Seed Coupon table
  INSERT INTO "Coupon" (code, discount, active) VALUES
    ('ATELIER10', '10%', true),
    ('LOVE20', '20%', true)
  ON CONFLICT (code) DO NOTHING;

  -- Seed Brand table
  INSERT INTO "Brand" (id, name_en, origin) VALUES
    ('1', 'Royal Velvet', 'UAE'),
    ('2', 'Silk Ribbons', 'France'),
    ('3', 'Gold Foils', 'Italy')
  ON CONFLICT (id) DO NOTHING;

  -- Seed Subscriber table
  INSERT INTO "Subscriber" (email) VALUES
    ('sarah@example.ae'),
    ('rashid.f@gmail.com'),
    ('vip.gifting@dubai.ae')
  ON CONFLICT (email) DO NOTHING;
`;

async function main() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL database successfully!");
    await client.query(sql);
    console.log("Tables Coupon, Brand, and Subscriber created and seeded successfully!");
  } catch (err) {
    console.error("Database query failed:", err);
  } finally {
    await client.end();
    console.log("Uninstalling pg package...");
    execSync('npm uninstall pg', { stdio: 'inherit' });
  }
}

main();
