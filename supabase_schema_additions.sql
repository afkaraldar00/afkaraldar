-- ========================================================
-- AFKAR ALDAR (أفكار الدار) COMPLETE DB ALIGNMENT MIGRATION
-- Run this script in the Supabase SQL Editor
-- https://supabase.com/dashboard/project/dzxgdufdwbjaghuccthn/sql
-- ========================================================

-- ============================================================
-- SECTION A: CREATE BASE DEPENDENCY TABLES IF THEY DO NOT EXIST
-- ============================================================

-- A1. Coupon table (Admin coupons tab)
CREATE TABLE IF NOT EXISTS "Coupon" (
  code TEXT PRIMARY KEY,
  discount TEXT NOT NULL,
  "discountType" TEXT DEFAULT 'PERCENTAGE' NOT NULL,
  "discountValue" DECIMAL(10, 2) DEFAULT 10.00 NOT NULL,
  "maxUses" INTEGER DEFAULT 100 NOT NULL,
  "usedCount" INTEGER DEFAULT 0 NOT NULL,
  status TEXT DEFAULT 'ACTIVE' NOT NULL,
  active BOOLEAN DEFAULT TRUE NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- A2. Brand table (Admin brands tab)
CREATE TABLE IF NOT EXISTS "Brand" (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  origin TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- A3. Subscriber table (Admin subscribers)
CREATE TABLE IF NOT EXISTS "Subscriber" (
  email TEXT PRIMARY KEY,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================
-- SECTION B: ALTER EXISTING TABLES (Add missing columns safely)
-- ============================================================

-- B1. Customer — VIP tiers, spend cache (Profile page, Admin clients tab)
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'Emerald VIP' NOT NULL;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "totalSpent" DECIMAL(10, 2) DEFAULT 0.00 NOT NULL;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "totalOrders" INTEGER DEFAULT 0 NOT NULL;

-- B2. GiftBox — pricing/stock/brand (Admin products tab)
ALTER TABLE "GiftBox" ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2) DEFAULT 0.00 NOT NULL;
ALTER TABLE "GiftBox" ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE "GiftBox" ADD COLUMN IF NOT EXISTS brand_en TEXT DEFAULT 'Royal Velvet' NOT NULL;

-- B3. Ticket — category field and auto ID defaults (Support page, Profile tickets tab, Admin support tab)
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'GENERAL' NOT NULL;
ALTER TABLE "Ticket" ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- B4. Coupon — admin controls (Ensuring all columns exist)
ALTER TABLE "Coupon" ADD COLUMN IF NOT EXISTS "discountType" TEXT DEFAULT 'PERCENTAGE' NOT NULL;
ALTER TABLE "Coupon" ADD COLUMN IF NOT EXISTS "discountValue" DECIMAL(10, 2) DEFAULT 10.00 NOT NULL;
ALTER TABLE "Coupon" ADD COLUMN IF NOT EXISTS "maxUses" INTEGER DEFAULT 100 NOT NULL;
ALTER TABLE "Coupon" ADD COLUMN IF NOT EXISTS "usedCount" INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE "Coupon" ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE' NOT NULL;

-- B5. Notification — type/category/actions/amount/orderId (Admin notifications, User notifications)
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'ORDER_STATUS' NOT NULL;
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "actionUrl" TEXT;
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "actionText" TEXT;
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS amount DECIMAL(10, 2);
ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "orderId" TEXT REFERENCES "Order"(id) ON DELETE SET NULL;

-- B6. Occasion — image, description, category, badge (Occasions page, Home page shop-by-occasion)
ALTER TABLE "Occasion" ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE "Occasion" ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE "Occasion" ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE "Occasion" ADD COLUMN IF NOT EXISTS badge TEXT;
ALTER TABLE "Occasion" ADD COLUMN IF NOT EXISTS "boxCount" TEXT;

-- ============================================================
-- SECTION C: CREATE OTHER APP TABLES
-- ============================================================

-- C1. CalendarReminder — Gifting Calendar (Profile calendar tab)
CREATE TABLE IF NOT EXISTS "CalendarReminder" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  title TEXT NOT NULL,
  "recipientName" TEXT NOT NULL,
  "occasionDate" DATE NOT NULL,
  "occasionSlug" TEXT NOT NULL,
  "reminderDaysBefore" INTEGER DEFAULT 7 NOT NULL,
  notes TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- C2. Address — Saved Delivery Addresses (Profile addresses tab)
CREATE TABLE IF NOT EXISTS "Address" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  label TEXT NOT NULL,
  "recipientName" TEXT NOT NULL,
  phone TEXT NOT NULL,
  emirate TEXT DEFAULT 'Dubai' NOT NULL,
  street TEXT NOT NULL,
  "buildingVilla" TEXT NOT NULL,
  notes TEXT,
  "isDefault" BOOLEAN DEFAULT FALSE NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- C3. Inventory — Packaging Stock (Admin inventory tab)
CREATE TABLE IF NOT EXISTS "Inventory" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  stock INTEGER DEFAULT 0 NOT NULL,
  "minThreshold" INTEGER DEFAULT 10 NOT NULL,
  unit TEXT DEFAULT 'units' NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- C4. WebhookLog — Webhook event logs (Admin webhooks page)
CREATE TABLE IF NOT EXISTS "WebhookLog" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  source TEXT NOT NULL, -- STRIPE, RAILWAY, FCM, RESEND
  event TEXT NOT NULL,
  status INTEGER NOT NULL,
  "latencyMs" INTEGER,
  "payloadSnippet" TEXT,
  "endpointUrl" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- C5. FcmToken — Web Push token registry (Notification page push enable button)
CREATE TABLE IF NOT EXISTS "FcmToken" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "Customer"(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- C6. LookbookItem — Inspiration gallery items (Inspiration page)
CREATE TABLE IF NOT EXISTS "LookbookItem" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  occasion TEXT NOT NULL,
  image TEXT NOT NULL,
  tagline TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- C7. Testimonial — Customer reviews (Home page testimonials section)
CREATE TABLE IF NOT EXISTS "Testimonial" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  quote TEXT NOT NULL,
  author TEXT NOT NULL,
  location TEXT NOT NULL,
  avatar TEXT,
  rating INTEGER DEFAULT 5 NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- C8. ResponseTemplate — Gifting advisor message templates (Admin templates tab)
CREATE TABLE IF NOT EXISTS "ResponseTemplate" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  channel TEXT NOT NULL, -- WhatsApp, Email, Email & WhatsApp
  category TEXT NOT NULL, -- Pricing, Customization, Delivery, Payment
  body TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- C9. UserPreference — Notification & account preferences (Profile settings tab)
CREATE TABLE IF NOT EXISTS "UserPreference" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT UNIQUE NOT NULL,
  "preferredCurrency" TEXT DEFAULT 'AED' NOT NULL,
  "preferredLanguage" TEXT DEFAULT 'EN' NOT NULL,
  "whatsappUpdates" BOOLEAN DEFAULT TRUE NOT NULL,
  "emailPaymentLinks" BOOLEAN DEFAULT TRUE NOT NULL,
  "calendarReminders" BOOLEAN DEFAULT TRUE NOT NULL,
  "vipPreviews" BOOLEAN DEFAULT TRUE NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================
-- SECTION D: ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE "Coupon" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Brand" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscriber" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CalendarReminder" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Address" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Inventory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WebhookLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FcmToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LookbookItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Testimonial" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ResponseTemplate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserPreference" ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- SECTION E: SEED DATA
-- ============================================================

-- E1. Update Occasion records with images, descriptions, categories, and badges
UPDATE "Occasion" SET
  image = '/occasions/birthday.png',
  description = 'Vibrant, joyful curations filled with luxury treats, personalized cakes, and festive keepsakes.',
  category = 'celebrations',
  badge = 'Festive',
  "boxCount" = '8 Signature Gift Box Designs'
WHERE slug = 'birthday';

UPDATE "Occasion" SET
  image = '/occasions/wedding.png',
  description = 'Timeless romantic keepsakes, engraved champagne flutes, and silk-lined keepsake boxes.',
  category = 'personal',
  badge = 'Popular',
  "boxCount" = '6 Bespoke Couples Collections'
WHERE slug = 'wedding';

UPDATE "Occasion" SET
  image = '/occasions/graduation.png',
  description = 'Sophisticated achievements celebrated with premium accessories, leather journals, and gold pens.',
  category = 'milestones',
  badge = 'Elite',
  "boxCount" = '5 Executive Gift Boxes'
WHERE slug = 'graduation';

UPDATE "Occasion" SET
  image = '/occasions/new-baby.png',
  description = 'Gentle pastel boxes filled with organic cotton, silver rattles, and parental treats.',
  category = 'personal',
  badge = 'Warm',
  "boxCount" = '4 Soft Nursery Curations'
WHERE slug = 'new-baby';

UPDATE "Occasion" SET
  image = '/occasions/corporate.png',
  description = 'High-end branded executive gifts that leave an enduring impression on partners and VIP clients.',
  category = 'corporate',
  badge = 'VIP',
  "boxCount" = 'Custom Bulk Packaging Available'
WHERE slug = 'corporate';

UPDATE "Occasion" SET
  image = '/occasions/just-because.png',
  description = 'Spontaneous tokens of affection and gratitude for someone special in your life.',
  category = 'celebrations',
  badge = 'Spontaneous',
  "boxCount" = 'Endless Custom Variations'
WHERE slug = 'just-because';

-- E2. Coupon seeds
INSERT INTO "Coupon" (code, discount, "discountType", "discountValue", "maxUses", "usedCount", status, active) VALUES
  ('AFKAR10', '10%', 'PERCENTAGE', 10.00, 100, 14, 'ACTIVE', true),
  ('VIPDUBAI250', 'AED 250', 'FIXED', 250.00, 50, 8, 'ACTIVE', true),
  ('WELCOME50', '50%', 'PERCENTAGE', 50.00, 200, 32, 'ACTIVE', true)
ON CONFLICT (code) DO NOTHING;

-- E3. Inventory seeds
INSERT INTO "Inventory" (id, name, type, stock, "minThreshold", unit) VALUES
  ('inv_1', 'Royal Emerald Velvet Box Shell', 'Box Shell', 34, 10, 'units'),
  ('inv_2', 'Obsidian Black Velvet Box Shell', 'Box Shell', 22, 10, 'units'),
  ('inv_3', 'Soft Rose Quartz Box Shell', 'Box Shell', 8, 12, 'units'),
  ('inv_4', 'Champagne Gold Satin Ribbon', 'Ribbon Roll', 45, 15, 'rolls'),
  ('inv_5', 'Gold Foil Embossed Calligraphy Cards', 'Cards', 120, 30, 'cards'),
  ('inv_6', 'Ivory Suede Interior Linings', 'Lining', 6, 15, 'sheets')
ON CONFLICT (id) DO NOTHING;

-- E4. Lookbook seeds (Inspiration page)
INSERT INTO "LookbookItem" (title, occasion, image, tagline) VALUES
  ('Royal Emerald Velvet Wedding Keepsake', 'Weddings & Romance', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000', 'Engraved crystal flutes, gold-leaf card envelope, and luxury Belgian chocolates.'),
  ('Golden Hour Birthday Celebration', 'Birthday Celebrations', 'https://images.unsplash.com/photo-1513885535751-8b9238bd48d7?q=80&w=1000', 'Champagne foil finish box, personalized leather journal, and Oud fragrance mini.'),
  ('The Executive VIP Suite', 'Corporate Gifting', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000', 'Matte black box with brass clasp, hot-stamped client logo, and single-origin roast.'),
  ('Sweet Lullaby Nursery Collection', 'New Baby & Parents', 'https://images.unsplash.com/photo-1512909006721-3d6018887383?q=80&w=1000', 'Cashmere blanket, sterling baby spoon, and organic chamomile pampering soaps.')
ON CONFLICT DO NOTHING;

-- E5. Testimonial seeds (Home page)
INSERT INTO "Testimonial" (quote, author, location, avatar, rating) VALUES
  ('The velvet packaging and gold foil calligraphy are absolute perfection! My sister loved her anniversary gift box.', 'Sarah A.', 'Dubai, Jumeirah', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop', 5),
  ('Superb quality, handpicked artisanal items, and express same-day delivery in DIFC. Highly recommended!', 'Tariq H.', 'Dubai, DIFC', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop', 5),
  ('Ordered corporate luxury gift boxes for our end-of-year gala and all our VIP guests were blown away.', 'Mariam M.', 'Abu Dhabi', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop', 5)
ON CONFLICT DO NOTHING;

-- E6. Response Template seeds (Admin templates tab)
INSERT INTO "ResponseTemplate" (title, channel, category, body) VALUES
  ('Price Quote Ready (WhatsApp)', 'WhatsApp', 'Pricing', E'Hello {{CustomerName}},\n\nYour bespoke {{BoxName}} order request (#{{OrderId}}) has been reviewed by our design team!\n\nFinal Confirmed Price: AED {{Price}}\nView your box specifications and review payment details here:\n{{CheckoutUrl}}\n\nThank you for choosing Afkar Aldar.'),
  ('Gold Foil Calligraphy Proof (WhatsApp)', 'WhatsApp', 'Customization', E'Hello {{CustomerName}},\n\nHere is the calligraphy proof for your greeting card message on order #{{OrderId}}:\n\n''{{CardMessage}}''\n\nPlease confirm if you approve this wording so our calligrapher can begin crafting.'),
  ('Delivery Slot Confirmation (WhatsApp)', 'WhatsApp', 'Delivery', E'Hello {{CustomerName}},\n\nYour customized gift box #{{OrderId}} has been prepared and scheduled for express courier delivery to {{Emirate}} on {{DeliveryDate}}.\n\nOur driver will contact you 30 minutes prior to arrival.'),
  ('Payment Link Reminder (Email / WhatsApp)', 'Email & WhatsApp', 'Payment', E'Dear {{CustomerName}},\n\nThis is a gentle reminder that your custom gift box order #{{OrderId}} is awaiting payment confirmation.\n\nYou can safely complete your order via credit card here:\n{{CheckoutUrl}}\n\nPlease let us know if you need any adjustments to your order.')
ON CONFLICT DO NOTHING;

-- E7. Brand seeds
INSERT INTO "Brand" (id, name_en, origin) VALUES
  ('1', 'Royal Velvet', 'UAE'),
  ('2', 'Silk Ribbons', 'France'),
  ('3', 'Gold Foils', 'Italy')
ON CONFLICT (id) DO NOTHING;

-- E8. Subscriber seeds
INSERT INTO "Subscriber" (email) VALUES
  ('sarah@example.ae'),
  ('rashid.f@gmail.com'),
  ('vip.gifting@dubai.ae')
ON CONFLICT (email) DO NOTHING;
