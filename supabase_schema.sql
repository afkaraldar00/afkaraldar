-- ==========================================
-- Supabase SQL Schema for Atelier Boxes
-- Paste this script into the Supabase SQL Editor
-- ==========================================

-- 1. DROP EXISTING TABLES (Optional, for clean resets)
-- DROP TABLE IF EXISTS "WishlistItem" CASCADE;
-- DROP TABLE IF EXISTS "Notification" CASCADE;
-- DROP TABLE IF EXISTS "Ticket" CASCADE;
-- DROP TABLE IF EXISTS "AdminUser" CASCADE;
-- DROP TABLE IF EXISTS "Payment" CASCADE;
-- DROP TABLE IF EXISTS "OrderStatusEvent" CASCADE;
-- DROP TABLE IF EXISTS "Order" CASCADE;
-- DROP TABLE IF EXISTS "GiftBox" CASCADE;
-- DROP TABLE IF EXISTS "Occasion" CASCADE;
-- DROP TABLE IF EXISTS "Customer" CASCADE;
-- DROP TYPE IF EXISTS order_status CASCADE;
-- DROP TYPE IF EXISTS payment_status CASCADE;
-- DROP TYPE IF EXISTS payment_type CASCADE;

-- 2. CREATE CUSTOM ENUM TYPES
CREATE TYPE order_status AS ENUM (
  'NEW_REQUEST',
  'CONTACTED',
  'DETAILS_CONFIRMED',
  'PRICE_CONFIRMED',
  'AWAITING_PAYMENT',
  'DEPOSIT_PAID',
  'PAID',
  'PREPARING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED'
);

CREATE TYPE payment_status AS ENUM (
  'UNPAID',
  'PENDING',
  'PAID',
  'PARTIALLY_PAID',
  'FAILED',
  'REFUNDED'
);

CREATE TYPE payment_type AS ENUM (
  'FULL',
  'DEPOSIT'
);

-- 3. CREATE CUSTOMER TABLE
CREATE TABLE "Customer" (
  id TEXT PRIMARY KEY,
  "authUserId" TEXT UNIQUE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  tier TEXT DEFAULT 'Emerald VIP' NOT NULL,
  "totalSpent" DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
  "totalOrders" INTEGER DEFAULT 0 NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. CREATE OCCASION TABLE
CREATE TABLE "Occasion" (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  image TEXT,
  description TEXT,
  category TEXT,
  badge TEXT,
  "boxCount" TEXT
);

-- 5. CREATE GIFTBOX TABLE
CREATE TABLE "GiftBox" (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  images TEXT[] NOT NULL,
  "occasionId" TEXT NOT NULL REFERENCES "Occasion"(id) ON DELETE RESTRICT,
  customizable BOOLEAN DEFAULT TRUE NOT NULL,
  price DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
  stock INTEGER DEFAULT 0 NOT NULL,
  brand_en TEXT DEFAULT 'Royal Velvet' NOT NULL
);

-- 6. CREATE ORDER TABLE
CREATE TABLE "Order" (
  id TEXT PRIMARY KEY,
  "customerId" TEXT NOT NULL REFERENCES "Customer"(id) ON DELETE RESTRICT,
  "giftBoxId" TEXT NOT NULL REFERENCES "GiftBox"(id) ON DELETE RESTRICT,
  "occasionSlug" TEXT NOT NULL,
  customization JSONB NOT NULL,
  "deliveryInfo" JSONB NOT NULL,
  status order_status DEFAULT 'NEW_REQUEST'::order_status NOT NULL,
  "finalPrice" DECIMAL(10, 2),
  currency TEXT DEFAULT 'AED',
  "paymentType" payment_type,
  "depositAmount" DECIMAL(10, 2),
  "checkoutSlug" TEXT UNIQUE,
  "checkoutActive" BOOLEAN DEFAULT FALSE NOT NULL,
  notes TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 7. CREATE ORDER STATUS HISTORY TABLE
CREATE TABLE "OrderStatusEvent" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "orderId" TEXT NOT NULL REFERENCES "Order"(id) ON DELETE CASCADE,
  status order_status NOT NULL,
  note TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 8. CREATE PAYMENT TABLE
CREATE TABLE "Payment" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "orderId" TEXT UNIQUE NOT NULL REFERENCES "Order"(id) ON DELETE CASCADE,
  provider TEXT DEFAULT 'stripe' NOT NULL,
  "providerRef" TEXT,
  "amountDue" DECIMAL(10, 2) NOT NULL,
  "amountPaid" DECIMAL(10, 2),
  type payment_type NOT NULL,
  status payment_status DEFAULT 'UNPAID'::payment_status NOT NULL,
  "linkSharedVia" TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "paidAt" TIMESTAMP WITH TIME ZONE
);

-- 9. CREATE ADMINUSER TABLE
CREATE TABLE "AdminUser" (
  id TEXT PRIMARY KEY,
  "authUserId" TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin' NOT NULL
);

-- 10. CREATE SUPPORT TICKET TABLE
CREATE TABLE "Ticket" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "orderId" TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT DEFAULT 'GENERAL' NOT NULL,
  status TEXT DEFAULT 'OPEN' NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 11. CREATE NOTIFICATION TABLE
CREATE TABLE "Notification" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT DEFAULT 'ORDER_STATUS' NOT NULL,
  category TEXT,
  "actionUrl" TEXT,
  "actionText" TEXT,
  amount DECIMAL(10, 2),
  "orderId" TEXT REFERENCES "Order"(id) ON DELETE SET NULL,
  read BOOLEAN DEFAULT FALSE NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 12. CREATE WISHLISTITEM TABLE
CREATE TABLE "WishlistItem" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT,
  "giftBoxId" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 13. ENABLE ROW LEVEL SECURITY (RLS) FOR SENSITIVE DATA
ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AdminUser" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Ticket" ENABLE ROW LEVEL SECURITY;

-- 14. CREATE COUPON, BRAND, SUBSCRIBER, CALENDAR, INVENTORY, WEBHOOK, FCM, AND LOOKBOOK TABLES
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

CREATE TABLE IF NOT EXISTS "Inventory" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  stock INTEGER DEFAULT 0 NOT NULL,
  "minThreshold" INTEGER DEFAULT 10 NOT NULL,
  unit TEXT DEFAULT 'units' NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "WebhookLog" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  source TEXT NOT NULL,
  event TEXT NOT NULL,
  status INTEGER NOT NULL,
  "latencyMs" INTEGER,
  "payloadSnippet" TEXT,
  "endpointUrl" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "FcmToken" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "Customer"(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "LookbookItem" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  occasion TEXT NOT NULL,
  image TEXT NOT NULL,
  tagline TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

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

CREATE TABLE IF NOT EXISTS "Testimonial" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  quote TEXT NOT NULL,
  author TEXT NOT NULL,
  location TEXT NOT NULL,
  avatar TEXT,
  rating INTEGER DEFAULT 5 NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "ResponseTemplate" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  channel TEXT NOT NULL,
  category TEXT NOT NULL,
  body TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

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

ALTER TABLE "Coupon" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Brand" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscriber" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CalendarReminder" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Inventory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WebhookLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FcmToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LookbookItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Address" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Testimonial" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ResponseTemplate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserPreference" ENABLE ROW LEVEL SECURITY;

INSERT INTO "Occasion" (id, slug, name, image, description, category, badge, "boxCount") VALUES
  ('occ_1', 'birthday', 'Birthday Celebrations', '/occasions/birthday.png', 'Vibrant, joyful curations filled with luxury treats, personalized cakes, and festive keepsakes.', 'celebrations', 'Festive', '8 Signature Gift Box Designs'),
  ('occ_2', 'wedding', 'Weddings & Anniversaries', '/occasions/wedding.png', 'Timeless romantic keepsakes, engraved champagne flutes, and silk-lined keepsake boxes.', 'personal', 'Popular', '6 Bespoke Couples Collections'),
  ('occ_3', 'graduation', 'Graduation & Milestones', '/occasions/graduation.png', 'Sophisticated achievements celebrated with premium accessories, leather journals, and gold pens.', 'milestones', 'Elite', '5 Executive Gift Boxes'),
  ('occ_4', 'new-baby', 'New Baby & Parenthood', '/occasions/new-baby.png', 'Gentle pastel boxes filled with organic cotton, silver rattles, and parental treats.', 'personal', 'Warm', '4 Soft Nursery Curations'),
  ('occ_5', 'corporate', 'Corporate Luxury Gifting', '/occasions/corporate.png', 'High-end branded executive gifts that leave an enduring impression on partners and VIP clients.', 'corporate', 'VIP', 'Custom Bulk Packaging Available'),
  ('occ_6', 'just-because', 'Just Because', '/occasions/just-because.png', 'Spontaneous tokens of affection and gratitude for someone special in your life.', 'celebrations', 'Spontaneous', 'Endless Custom Variations')
ON CONFLICT (slug) DO UPDATE SET
  image = EXCLUDED.image,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  "boxCount" = EXCLUDED."boxCount";

INSERT INTO "Coupon" (code, discount, "discountType", "discountValue", "maxUses", "usedCount", status, active) VALUES
  ('AFKAR10', '10%', 'PERCENTAGE', 10.00, 100, 14, 'ACTIVE', true),
  ('VIPDUBAI250', 'AED 250', 'FIXED', 250.00, 50, 8, 'ACTIVE', true),
  ('WELCOME50', '50%', 'PERCENTAGE', 50.00, 200, 32, 'ACTIVE', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO "Brand" (id, name_en, origin) VALUES
  ('1', 'Royal Velvet', 'UAE'),
  ('2', 'Silk Ribbons', 'France'),
  ('3', 'Gold Foils', 'Italy')
ON CONFLICT (id) DO NOTHING;

INSERT INTO "Subscriber" (email) VALUES
  ('sarah@example.ae'),
  ('rashid.f@gmail.com'),
  ('vip.gifting@dubai.ae')
ON CONFLICT (email) DO NOTHING;

INSERT INTO "Inventory" (id, name, type, stock, "minThreshold", unit) VALUES
  ('inv_1', 'Royal Emerald Velvet Box Shell', 'Box Shell', 34, 10, 'units'),
  ('inv_2', 'Obsidian Black Velvet Box Shell', 'Box Shell', 22, 10, 'units'),
  ('inv_3', 'Soft Rose Quartz Box Shell', 'Box Shell', 8, 12, 'units'),
  ('inv_4', 'Champagne Gold Satin Ribbon', 'Ribbon Roll', 45, 15, 'rolls'),
  ('inv_5', 'Gold Foil Embossed Calligraphy Cards', 'Cards', 120, 30, 'cards'),
  ('inv_6', 'Ivory Suede Interior Linings', 'Lining', 6, 15, 'sheets')
ON CONFLICT (id) DO NOTHING;

INSERT INTO "LookbookItem" (title, occasion, image, tagline) VALUES
  ('Royal Emerald Velvet Wedding Keepsake', 'Weddings & Romance', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000', 'Engraved crystal flutes, gold-leaf card envelope, and luxury Belgian chocolates.'),
  ('Golden Hour Birthday Celebration', 'Birthday Celebrations', 'https://images.unsplash.com/photo-1513885535751-8b9238bd48d7?q=80&w=1000', 'Champagne foil finish box, personalized leather journal, and Oud fragrance mini.'),
  ('The Executive VIP Suite', 'Corporate Gifting', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000', 'Matte black box with brass clasp, hot-stamped client logo, and single-origin roast.'),
  ('Sweet Lullaby Nursery Collection', 'New Baby & Parents', 'https://images.unsplash.com/photo-1512909006721-3d6018887383?q=80&w=1000', 'Cashmere blanket, sterling baby spoon, and organic chamomile pampering soaps.')
ON CONFLICT DO NOTHING;

INSERT INTO "Testimonial" (quote, author, location, avatar, rating) VALUES
  ('The velvet packaging and gold foil calligraphy are absolute perfection! My sister loved her anniversary gift box.', 'Sarah A.', 'Dubai, Jumeirah', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop', 5),
  ('Superb quality, handpicked artisanal items, and express same-day delivery in DIFC. Highly recommended!', 'Tariq H.', 'Dubai, DIFC', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop', 5),
  ('Ordered corporate luxury gift boxes for our end-of-year gala and all our VIP guests were blown away.', 'Mariam M.', 'Abu Dhabi', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop', 5)
ON CONFLICT DO NOTHING;

INSERT INTO "ResponseTemplate" (title, channel, category, body) VALUES
  ('Price Quote Ready (WhatsApp)', 'WhatsApp', 'Pricing', E'Hello {{CustomerName}},\n\nYour bespoke {{BoxName}} order request (#{{OrderId}}) has been reviewed by our design team!\n\nFinal Confirmed Price: AED {{Price}}\nView your box specifications and review payment details here:\n{{CheckoutUrl}}\n\nThank you for choosing Afkar Aldar.'),
  ('Gold Foil Calligraphy Proof (WhatsApp)', 'WhatsApp', 'Customization', E'Hello {{CustomerName}},\n\nHere is the calligraphy proof for your greeting card message on order #{{OrderId}}:\n\n''{{CardMessage}}''\n\nPlease confirm if you approve this wording so our calligrapher can begin crafting.'),
  ('Delivery Slot Confirmation (WhatsApp)', 'WhatsApp', 'Delivery', E'Hello {{CustomerName}},\n\nYour customized gift box #{{OrderId}} has been prepared and scheduled for express courier delivery to {{Emirate}} on {{DeliveryDate}}.\n\nOur driver will contact you 30 minutes prior to arrival.'),
  ('Payment Link Reminder (Email / WhatsApp)', 'Email & WhatsApp', 'Payment', E'Dear {{CustomerName}},\n\nThis is a gentle reminder that your custom gift box order #{{OrderId}} is awaiting payment confirmation.\n\nYou can safely complete your order via credit card here:\n{{CheckoutUrl}}\n\nPlease let us know if you need any adjustments to your order.')
ON CONFLICT DO NOTHING;
