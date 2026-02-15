import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_addresses_country" ADD VALUE 'IR' BEFORE 'US';
  ALTER TYPE "public"."enum_addresses_country" ADD VALUE 'TR';
  ALTER TYPE "public"."enum_addresses_country" ADD VALUE 'AE';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "addresses" ALTER COLUMN "country" SET DATA TYPE text;
  DROP TYPE "public"."enum_addresses_country";
  CREATE TYPE "public"."enum_addresses_country" AS ENUM('US', 'GB', 'CA', 'AU', 'AT', 'BE', 'BR', 'BG', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HK', 'HU', 'IN', 'IE', 'IT', 'JP', 'LV', 'LT', 'LU', 'MY', 'MT', 'MX', 'NL', 'NZ', 'NO', 'PL', 'PT', 'RO', 'SG', 'SK', 'SI', 'ES', 'SE', 'CH');
  ALTER TABLE "addresses" ALTER COLUMN "country" SET DATA TYPE "public"."enum_addresses_country" USING "country"::"public"."enum_addresses_country";`)
}
