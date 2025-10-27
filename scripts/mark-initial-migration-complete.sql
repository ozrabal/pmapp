-- Script to manually mark the initial migration as applied
-- Run this if you have tables that already exist and want to skip the initial migration

-- First, check if the migration record exists
SELECT * FROM "__drizzle_migrations" WHERE hash = (
  SELECT hash FROM (VALUES 
    ('0000_sleepy_the_order')
  ) AS t(tag)
);

-- If the above returns no results, insert the migration record
INSERT INTO "__drizzle_migrations" (hash, created_at)
SELECT '0000_sleepy_the_order', extract(epoch from now()) * 1000
WHERE NOT EXISTS (
  SELECT 1 FROM "__drizzle_migrations" WHERE hash = '0000_sleepy_the_order'
);

-- Show current migration status
SELECT * FROM "__drizzle_migrations" ORDER BY created_at;