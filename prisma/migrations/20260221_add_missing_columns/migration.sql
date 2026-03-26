-- Add missing banner columns to Settings table
ALTER TABLE "public"."Settings" ADD COLUMN "bannerImage4" TEXT NOT NULL DEFAULT '';
ALTER TABLE "public"."Settings" ADD COLUMN "bannerImage5" TEXT NOT NULL DEFAULT '';
ALTER TABLE "public"."Settings" ADD COLUMN "bannerTitle4" TEXT NOT NULL DEFAULT '';
ALTER TABLE "public"."Settings" ADD COLUMN "bannerTitle5" TEXT NOT NULL DEFAULT '';

-- Add missing columns to Order table (if not already exist)
ALTER TABLE "public"."Order" ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING';
ALTER TABLE "public"."Order" ADD COLUMN IF NOT EXISTS "razorpayOrderId" TEXT;
ALTER TABLE "public"."Order" ADD COLUMN IF NOT EXISTS "razorpayPaymentId" TEXT;
ALTER TABLE "public"."Order" ADD COLUMN IF NOT EXISTS "razorpaySignature" TEXT;
ALTER TABLE "public"."Order" ADD COLUMN IF NOT EXISTS "isCancelled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "public"."Order" ADD COLUMN IF NOT EXISTS "cancellationReason" TEXT;
ALTER TABLE "public"."Order" ADD COLUMN IF NOT EXISTS "cancellationDescription" TEXT;
ALTER TABLE "public"."Order" ADD COLUMN IF NOT EXISTS "cancelledBy" TEXT;
ALTER TABLE "public"."Order" ADD COLUMN IF NOT EXISTS "cancelledAt" TIMESTAMP(3);

-- Add missing columns to Product table
ALTER TABLE "public"."Product" ADD COLUMN IF NOT EXISTS "isClothing" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "public"."Product" ADD COLUMN IF NOT EXISTS "totalUnits" INTEGER NOT NULL DEFAULT 0;

-- Update PaymentMethod and OrderStatus enums
DROP TYPE IF EXISTS "public"."PaymentMethod" CASCADE;
CREATE TYPE "public"."PaymentMethod" AS ENUM ('COD', 'RAZORPAY_CARD', 'RAZORPAY_UPI', 'RAZORPAY_WALLET');

DROP TYPE IF EXISTS "public"."OrderStatus" CASCADE;
CREATE TYPE "public"."OrderStatus" AS ENUM ('ORDER_PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

DROP TYPE IF EXISTS "public"."PaymentStatus" CASCADE;
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

DROP TYPE IF EXISTS "public"."CancellationReason" CASCADE;
CREATE TYPE "public"."CancellationReason" AS ENUM ('CHANGED_MIND', 'FOUND_CHEAPER', 'DONT_NEED_ANYMORE', 'DELIVERY_LATE', 'OTHER_REASON', 'OUT_OF_STOCK', 'INSUFFICIENT_QUANTITY', 'PRODUCT_UNAVAILABLE', 'QUALITY_ISSUE', 'SELLER_REQUEST');

-- Alter Order table to use new enum types
ALTER TABLE "public"."Order" DROP COLUMN "paymentMethod";
ALTER TABLE "public"."Order" ADD COLUMN "paymentMethod" "public"."PaymentMethod" NOT NULL DEFAULT 'COD';
