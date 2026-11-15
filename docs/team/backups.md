# Database backups

Two layers, so losing one never loses the data:

1. **Supabase's own daily backups.** Only on the Pro plan (7 days kept). The free plan has
   none. Upgrade before real users depend on the app.
2. **Our weekly off-site copy** (`.github/workflows/backup.yml`). Every Sunday at 03:23 UTC
   GitHub dumps the database, encrypts it, keeps it for 90 days, and checks that it restores.
   This works on any plan and doesn't rely on Supabase.

## One-time setup (owner)
1. Supabase → your project → **Connect** → copy the **Session pooler** connection string
   (port 5432). Not "Direct": GitHub's machines can't reach the direct address. Put your
   database password into it.
2. Make a long random passphrase in your password manager. **Without it the backups can't be
   opened**, so store it somewhere other than GitHub too.
3. GitHub → the repo → Settings → Secrets and variables → Actions → **New repository secret**:
   - `SUPABASE_DB_URL` = the connection string
   - `BACKUP_PASSPHRASE` = the passphrase
4. Actions → **Backup** → **Run workflow** to test it now. It should end green, with an
   artifact named `woloflink-db-<date>` and a line "auth users restored: N".

If the database password changes, update `SUPABASE_DB_URL`.

## Getting a backup back
1. Actions → Backup → pick a run → download the artifact (a zip containing a `.gpg` file).
2. Decrypt and unpack:
   ```
   gpg --decrypt woloflink-db-2026-11-22.tar.gz.gpg > backup.tar.gz
   tar -xzf backup.tar.gz   # gives roles.sql, schema.sql, data.sql
   ```
3. Restore into a **new, empty** Supabase project (never over the live one), using its
   session pooler connection string:
   ```
   psql --single-transaction --variable ON_ERROR_STOP=1 \
     --file roles.sql --file schema.sql \
     --command 'SET session_replication_role = replica' \
     --file data.sql --dbname "<new project connection string>"
   ```
   Then point the app at the new project (URL and publishable key) or copy back just the
   tables you need. Supabase's guide covers the details:
   https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore

## What's in it, and what isn't
- In: every table, including sign-in accounts (`auth`), with roles and the database schema.
- Not in: files in Supabase Storage (voice recordings), edge function code (that's in this
  repo already), and dashboard settings such as email templates and secrets.
- The backup holds learners' emails and progress. Treat a downloaded copy like the live
  database: decrypt it only on your own computer and delete it when done.
