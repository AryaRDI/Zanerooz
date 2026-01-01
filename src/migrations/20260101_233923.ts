import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_carts_currency" ADD VALUE 'IRT';
  ALTER TYPE "public"."enum_orders_currency" ADD VALUE 'IRT';
  ALTER TYPE "public"."enum_transactions_currency" ADD VALUE 'IRT';
  ALTER TABLE "variants" ADD COLUMN "price_in_i_r_t_enabled" boolean;
  ALTER TABLE "variants" ADD COLUMN "price_in_i_r_t" numeric;
  ALTER TABLE "_variants_v" ADD COLUMN "version_price_in_i_r_t_enabled" boolean;
  ALTER TABLE "_variants_v" ADD COLUMN "version_price_in_i_r_t" numeric;
  ALTER TABLE "products" ADD COLUMN "price_in_i_r_t_enabled" boolean;
  ALTER TABLE "products" ADD COLUMN "price_in_i_r_t" numeric;
  ALTER TABLE "_products_v" ADD COLUMN "version_price_in_i_r_t_enabled" boolean;
  ALTER TABLE "_products_v" ADD COLUMN "version_price_in_i_r_t" numeric;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "carts" ALTER COLUMN "currency" SET DATA TYPE text;
  ALTER TABLE "carts" ALTER COLUMN "currency" SET DEFAULT 'USD'::text;
  DROP TYPE "public"."enum_carts_currency";
  CREATE TYPE "public"."enum_carts_currency" AS ENUM('USD');
  ALTER TABLE "carts" ALTER COLUMN "currency" SET DEFAULT 'USD'::"public"."enum_carts_currency";
  ALTER TABLE "carts" ALTER COLUMN "currency" SET DATA TYPE "public"."enum_carts_currency" USING "currency"::"public"."enum_carts_currency";
  ALTER TABLE "orders" ALTER COLUMN "currency" SET DATA TYPE text;
  ALTER TABLE "orders" ALTER COLUMN "currency" SET DEFAULT 'USD'::text;
  DROP TYPE "public"."enum_orders_currency";
  CREATE TYPE "public"."enum_orders_currency" AS ENUM('USD');
  ALTER TABLE "orders" ALTER COLUMN "currency" SET DEFAULT 'USD'::"public"."enum_orders_currency";
  ALTER TABLE "orders" ALTER COLUMN "currency" SET DATA TYPE "public"."enum_orders_currency" USING "currency"::"public"."enum_orders_currency";
  ALTER TABLE "transactions" ALTER COLUMN "currency" SET DATA TYPE text;
  ALTER TABLE "transactions" ALTER COLUMN "currency" SET DEFAULT 'USD'::text;
  DROP TYPE "public"."enum_transactions_currency";
  CREATE TYPE "public"."enum_transactions_currency" AS ENUM('USD');
  ALTER TABLE "transactions" ALTER COLUMN "currency" SET DEFAULT 'USD'::"public"."enum_transactions_currency";
  ALTER TABLE "transactions" ALTER COLUMN "currency" SET DATA TYPE "public"."enum_transactions_currency" USING "currency"::"public"."enum_transactions_currency";
  ALTER TABLE "variants" DROP COLUMN "price_in_i_r_t_enabled";
  ALTER TABLE "variants" DROP COLUMN "price_in_i_r_t";
  ALTER TABLE "_variants_v" DROP COLUMN "version_price_in_i_r_t_enabled";
  ALTER TABLE "_variants_v" DROP COLUMN "version_price_in_i_r_t";
  ALTER TABLE "products" DROP COLUMN "price_in_i_r_t_enabled";
  ALTER TABLE "products" DROP COLUMN "price_in_i_r_t";
  ALTER TABLE "_products_v" DROP COLUMN "version_price_in_i_r_t_enabled";
  ALTER TABLE "_products_v" DROP COLUMN "version_price_in_i_r_t";`)
}
