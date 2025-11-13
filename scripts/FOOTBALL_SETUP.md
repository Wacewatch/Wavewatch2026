# Football Module Setup Guide

This guide explains how to set up the Football Module with database caching and API integration.

## Overview

The football module provides:
- Live match tracking and fixtures display
- 7-day upcoming fixtures preview
- Multiple league support (Ligue 1, Premier League, La Liga, Serie A, Bundesliga, Champions League)
- API response caching (Supabase + Memory)
- TV channel information for each match

## Prerequisites

1. **Supabase Integration**: Database must be connected
2. **API Key**: Free tier account from [api-sports.io](https://api-sports.io)
3. **Environment Variables**: `FOOTBALL_API_KEY` must be set

## Database Setup

### Step 1: Create Football Cache Table

Run the setup script to create the `football_cache` table:

\`\`\`bash
npm run setup-football-db
\`\`\`

Or manually execute the SQL from `scripts/create-football-cache-table.sql` in your Supabase SQL editor.

### Step 2: Verify Table Creation

The table should have these columns:
- `id` (BIGSERIAL PRIMARY KEY)
- `cache_key` (TEXT UNIQUE)
- `data` (JSONB)
- `created_at` (TIMESTAMP)
- `expires_at` (TIMESTAMP)

### Step 3: Verify RLS Policies

Ensure these policies are created:
- "Allow public read" - SELECT
- "Allow service role write" - INSERT
- "Allow service role update" - UPDATE
- "Allow service role delete" - DELETE

## API Configuration

### Step 1: Get API Key

1. Create a free account at [api-sports.io](https://api-sports.io)
2. Get your API key from the dashboard
3. Note: Free tier = 100 requests/day

### Step 2: Set Environment Variable

Add to your `.env.local` or Vercel project settings:

\`\`\`env
FOOTBALL_API_KEY=your_api_key_here
\`\`\`

### Step 3: Test API Endpoints

- **Fixtures**: `GET /api/football/fixtures?league=61&days=7`
- **Live Matches**: `GET /api/football/live`

## Caching Strategy

### Memory Cache (Session)
- **Fixtures**: 30 minutes TTL
- **Live Matches**: 5 minutes TTL
- Fast, in-memory access
- Cleared on server restart

### Supabase Cache (Persistent)
- **Fixtures**: 30 minutes TTL
- **Live Matches**: 5 minutes TTL
- Persists across server restarts
- Survives deployments

### Cache Flow
1. Check memory cache
2. If expired, check Supabase cache
3. If expired, fetch from API
4. Store in both caches
5. Return data

## Frontend Component

### FootballCalendarWidget

**Location**: `components/football-calendar-widget.tsx`

**Features**:
- Displays up to 15 upcoming/live matches
- League selector with 6 major leagues
- Auto-refresh every 5 minutes for live matches
- TV channel information
- Responsive design (mobile/desktop)
- Live match indicators with score updates

### Integration

\`\`\`tsx
import { FootballCalendarWidget } from "@/components/football-calendar-widget"

export default function HomePage() {
  return (
    <div>
      <FootballCalendarWidget />
    </div>
  )
}
\`\`\`

## Supported Leagues

| ID | League | TV Channels |
|----|--------|------------|
| 61 | Ligue 1 | Canal+, beIN Sports |
| 39 | Premier League | RMC Sport, Canal+ |
| 140 | La Liga | L'Équipe, beIN Sports |
| 135 | Serie A | Canal+, beIN Sports |
| 78 | Bundesliga | Canal+, beIN Sports |
| 2 | Champions League | Canal+, RMC Sport, TF1 |

## Troubleshooting

### "API temporairement indisponible"
- Check if `FOOTBALL_API_KEY` is set
- Check if API daily limit (100 requests) is exceeded
- API might be temporarily down

### Empty fixtures list
- Check if selected league has matches in the next 7 days
- Verify API key has access to selected league

### Cache not working
- Verify `football_cache` table exists
- Check RLS policies are correctly set
- Review logs in Supabase

## Monitoring

### Check Cache Status

Query Supabase to see cached data:

\`\`\`sql
SELECT cache_key, created_at, expires_at, data->>'response' as response_preview
FROM football_cache
ORDER BY created_at DESC
LIMIT 10;
\`\`\`

### Clear Old Cache

The system automatically clears expired cache entries through:
- `clearOldCache()` function after each live match fetch
- Supabase cleanup (records expire naturally)

### Manual Cache Clear

To manually clear football cache:

\`\`\`sql
DELETE FROM football_cache 
WHERE cache_key LIKE 'football_%';
\`\`\`

## API Rate Limits

**Free Tier**: 100 requests/day
- Each fixture fetch = 1 request
- Each live match check = 1 request

**Optimization Tips**:
- Fixtures cache for 30 minutes (reduces API calls)
- Live matches cache for 5 minutes
- Multiple users benefit from shared cache

## Performance Notes

- First request: 1-2 seconds (API call)
- Cached requests: <100ms (memory) or <300ms (Supabase)
- Auto-refresh interval: 5 minutes
- Memory cache cleared on server restart

## Next Steps

1. Run database setup script
2. Set `FOOTBALL_API_KEY` environment variable
3. Test endpoints: `/api/football/fixtures` and `/api/football/live`
4. Add `<FootballCalendarWidget />` to your pages
5. Monitor cache performance in Supabase
