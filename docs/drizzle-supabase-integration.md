# Drizzle ORM + Supabase Integration Guide

## Problem

When using Drizzle ORM with Supabase, you may encounter permission errors when trying to create tables in the `auth` schema:

```
DrizzleQueryError: permission denied for schema auth
```

This occurs because:

1. The `auth` schema in Supabase is managed by Supabase Auth
2. Your database user doesn't have permissions to create/modify tables in the `auth` schema
3. Drizzle tries to generate migrations that include the `auth.users` table definition

## Solution

### 1. Reference auth.users Without Defining It

In your schema files, reference the `auth.users` table without trying to define it:

```typescript
import { pgSchema, uuid } from "drizzle-orm/pg-core";

// Reference the auth schema (managed by Supabase, not in migrations)
const authSchema = pgSchema("auth");

// Reference auth.users table (don't define it, just reference it)
export const usersInAuth = authSchema.table("users", {
  id: uuid("id").primaryKey(),
});
```

**DO NOT** use `import { authUsers } from "drizzle-orm/supabase"` as this will cause Drizzle to try to create the table.

### 2. Configure Drizzle to Filter Out auth Schema

In `drizzle.config.ts`:

```typescript
export default defineConfig({
  out: "./migrations",
  schema: "./src/db/schema",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  schemaFilter: ["public"], // Only include public schema
  migrations: {
    schema: "public", // Run migrations in public schema only
  },
  tablesFilter: ["!auth.*"], // Exclude auth tables
});
```

### 3. Remove auth.users from Generated Migrations

Even with the above configuration, Drizzle may still generate the `CREATE TABLE "auth"."users"` statement. You need to remove it manually or use the provided script.

#### Manual Method

After generating migrations with `npx drizzle-kit generate`, edit the migration file and remove:

```sql
CREATE TABLE "auth"."users" (
	"id" uuid PRIMARY KEY NOT NULL
);
--> statement-breakpoint
```

#### Automated Method

Use the provided script:

```bash
./scripts/fix-drizzle-migration.sh
```

Or add to your workflow:

```bash
npx drizzle-kit generate && ./scripts/fix-drizzle-migration.sh
```

### 4. Update package.json Scripts

Add helpful scripts to your `package.json`:

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate && ./scripts/fix-drizzle-migration.sh",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

## Common Issues

### Issue: Operator class mismatch in indexes

**Error:**

```
operator class "text_ops" does not accept data type uuid
```

**Solution:**
Make sure your indexes use the correct operator class for the column type:

- UUID columns: use `uuid_ops`
- Text columns: use `text_ops`
- Enum columns: use `enum_ops`
- Boolean columns: use `bool_ops`
- Timestamp columns: use `timestamptz_ops`

Example:

```typescript
index("idx_tasks_project_functional_block").using(
  "btree",
  table.projectId.asc().nullsLast().op("uuid_ops"), // ✓ Correct
  table.functionalBlockId.asc().nullsLast().op("text_ops")
);
```

### Issue: Foreign key references to auth.users

This is fine! Your migrations can include foreign key constraints that reference `auth.users`:

```sql
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_fkey"
  FOREIGN KEY ("id") REFERENCES "auth"."users"("id")
  ON DELETE cascade;
```

The key is that you're **referencing** the table, not trying to **create** it.

## Best Practices

1. **Never modify the auth schema**: Let Supabase manage it completely
2. **Use foreign keys to auth.users**: This is how you connect your user data
3. **Create a profiles table**: Store additional user data in `public.profiles` with a foreign key to `auth.users`
4. **Test migrations locally**: Use Supabase CLI for local development
5. **Version control migrations**: Commit all migration files to git
6. **Backup before migrating**: Always backup your database before running migrations in production

## Example Schema Structure

```typescript
// Reference auth.users
const authSchema = pgSchema("auth");
export const usersInAuth = authSchema.table("users", {
  id: uuid("id").primaryKey(),
});

// Your profiles table
export const profiles = pgTable(
  "profiles",
  {
    id: uuid().primaryKey().notNull(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }),
    // ... other fields
  },
  (table) => [
    foreignKey({
      columns: [table.id],
      foreignColumns: [usersInAuth.id],
      name: "profiles_id_fkey",
    }),
    // ... policies and indexes
  ]
);
```

## Useful Commands

```bash
# Generate migration
npm run db:generate

# Apply migrations
npm run db:migrate

# Push schema directly (dev only)
npm run db:push

# Open Drizzle Studio
npm run db:studio
```

## Additional Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Supabase with Drizzle Guide](https://supabase.com/docs/guides/database/drizzle)
- [Supabase Auth Schema](https://supabase.com/docs/guides/auth)
