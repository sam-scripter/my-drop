-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "delivery_fee" DOUBLE PRECISION,
ADD COLUMN     "order_value" DOUBLE PRECISION,
ADD COLUMN     "payment_method" TEXT,
ADD COLUMN     "payment_status" TEXT;
