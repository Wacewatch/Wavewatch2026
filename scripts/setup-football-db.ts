import { neon } from '@neondatabase/serverless';

/**
 * Setup script for football module database
 * This script creates the football_cache table for caching API responses
 */

async function setupFootballDatabase() {
  if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
    console.error('[v0] DATABASE_URL or POSTGRES_URL environment variable not set');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL || '');

  try {
    console.log('[v0] Creating football_cache table...');

    // Create the football_cache table
    await sql`
      CREATE TABLE IF NOT EXISTS football_cache (
        id BIGSERIAL PRIMARY KEY,
        cache_key TEXT UNIQUE NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        
        CONSTRAINT football_cache_key_unique UNIQUE (cache_key)
      );
    `;

    console.log('[v0] Created football_cache table');

    // Create index on expires_at for efficient cleanup
    await sql`
      CREATE INDEX IF NOT EXISTS idx_football_cache_expires_at ON football_cache(expires_at);
    `;

    console.log('[v0] Created index on expires_at');

    // Enable RLS
    await sql`ALTER TABLE football_cache ENABLE ROW LEVEL SECURITY;`;

    console.log('[v0] Enabled Row Level Security');

    // Drop existing policies if they exist (to avoid conflicts)
    await sql`DROP POLICY IF EXISTS "Allow public read" ON football_cache;`.catch(() => {});
    await sql`DROP POLICY IF EXISTS "Allow service role write" ON football_cache;`.catch(() => {});
    await sql`DROP POLICY IF EXISTS "Allow service role update" ON football_cache;`.catch(() => {});
    await sql`DROP POLICY IF EXISTS "Allow service role delete" ON football_cache;`.catch(() => {});

    // Create RLS policies
    await sql`
      CREATE POLICY "Allow public read" ON football_cache 
      FOR SELECT 
      USING (true);
    `;

    await sql`
      CREATE POLICY "Allow service role write" ON football_cache 
      FOR INSERT 
      WITH CHECK (true);
    `;

    await sql`
      CREATE POLICY "Allow service role update" ON football_cache 
      FOR UPDATE 
      USING (true);
    `;

    await sql`
      CREATE POLICY "Allow service role delete" ON football_cache 
      FOR DELETE 
      USING (true);
    `;

    console.log('[v0] Created RLS policies');

    console.log('[v0] Football database setup completed successfully!');
    console.log('[v0] Make sure to set FOOTBALL_API_KEY environment variable for the API endpoints to work');

    process.exit(0);
  } catch (error) {
    console.error('[v0] Error setting up football database:', error);
    process.exit(1);
  }
}

setupFootballDatabase();
