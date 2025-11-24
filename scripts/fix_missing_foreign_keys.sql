-- Ajouter les foreign keys manquantes pour user_login_history et user_wishlist

-- Foreign key pour user_login_history
ALTER TABLE user_login_history
ADD CONSTRAINT user_login_history_user_id_fkey
FOREIGN KEY (user_id) REFERENCES user_profiles(user_id)
ON DELETE CASCADE;

-- Foreign key pour user_wishlist
ALTER TABLE user_wishlist
ADD CONSTRAINT user_wishlist_user_id_fkey
FOREIGN KEY (user_id) REFERENCES user_profiles(user_id)
ON DELETE CASCADE;

-- Fonction RPC pour obtenir les statistiques admin
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM user_profiles),
    'vip_users', (SELECT COUNT(*) FROM user_profiles WHERE is_vip = true),
    'admin_users', (SELECT COUNT(*) FROM user_profiles WHERE is_admin = true),
    'total_movies_watched', (SELECT COUNT(*) FROM user_watch_history WHERE content_type = 'movie'),
    'total_series_watched', (SELECT COUNT(*) FROM user_watch_history WHERE content_type = 'tv'),
    'total_favorites', (SELECT COUNT(*) FROM user_favorites),
    'total_wishlist', (SELECT COUNT(*) FROM user_wishlist),
    'total_ratings', (SELECT COUNT(*) FROM user_ratings),
    'total_page_views_today', (
      SELECT COALESCE(SUM(total_page_views), 0) 
      FROM site_analytics 
      WHERE date = CURRENT_DATE
    ),
    'unique_visitors_today', (
      SELECT COALESCE(SUM(unique_visitors), 0) 
      FROM site_analytics 
      WHERE date = CURRENT_DATE
    ),
    'online_users', (
      SELECT COUNT(*) 
      FROM online_users 
      WHERE last_activity > NOW() - INTERVAL '5 minutes'
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Creer la table analytics_events pour suivre les evenements
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_data jsonb,
  page_path text,
  session_id text,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT NOW()
);

-- Index pour ameliorer les performances
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);

-- RLS pour analytics_events
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_insert_analytics_events ON analytics_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY admin_view_analytics_events ON analytics_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.is_admin = true
    )
  );
