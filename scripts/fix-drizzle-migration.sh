#!/bin/bash
# Script to remove auth.users table creation from Drizzle migrations
# Since Supabase manages the auth schema, we shouldn't try to create auth.users

MIGRATION_DIR="./migrations"

# Find the latest migration file
LATEST_MIGRATION=$(ls -t $MIGRATION_DIR/*.sql 2>/dev/null | head -1)

if [ -z "$LATEST_MIGRATION" ]; then
  echo "No migration files found in $MIGRATION_DIR"
  exit 0
fi

echo "Checking migration file: $LATEST_MIGRATION"

# Check if the file contains the auth.users table creation
if grep -q 'CREATE TABLE "auth"\."users"' "$LATEST_MIGRATION"; then
  echo "Found auth.users table creation, removing it..."
  
  # Create a backup
  cp "$LATEST_MIGRATION" "$LATEST_MIGRATION.backup"
  
  # Remove the auth.users table creation block
  # This removes from "CREATE TABLE "auth"."users"" up to and including the next statement-breakpoint
  sed -i '' '/CREATE TABLE "auth"\."users"/,/);$/d' "$LATEST_MIGRATION"
  sed -i '' 's/--> statement-breakpoint--> statement-breakpoint/--> statement-breakpoint/g' "$LATEST_MIGRATION"
  
  echo "✓ Removed auth.users table creation from migration"
  echo "  Backup saved to: $LATEST_MIGRATION.backup"
else
  echo "✓ No auth.users table creation found - migration is clean"
fi
