-- Table pour stocker les statistiques quotidiennes du site
CREATE TABLE IF NOT EXISTS site_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  total_page_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  online_users_peak INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  movies_watched INTEGER DEFAULT 0,
  tv_shows_watched INTEGER DEFAULT 0,
  radio_listened INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour suivre les pages vues en temps réel
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(user_id),
  page_path TEXT NOT NULL,
  user_agent TEXT,
  ip_address INET,
  session_id TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_seconds INTEGER
);

-- Table pour suivre les utilisateurs en ligne
CREATE TABLE IF NOT EXISTS online_users (
  user_id UUID PRIMARY KEY REFERENCES user_profiles(user_id),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_page TEXT,
  session_id TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON page_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_page_views_user_id ON page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_site_analytics_date ON site_analytics(date);
CREATE INDEX IF NOT EXISTS idx_online_users_last_activity ON online_users(last_activity);

-- Fonction pour nettoyer les anciens utilisateurs en ligne (inactifs depuis plus de 5 minutes)
CREATE OR REPLACE FUNCTION cleanup_offline_users()
RETURNS void AS $$
BEGIN
  DELETE FROM online_users 
  WHERE last_activity < NOW() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre à jour les statistiques quotidiennes
CREATE OR REPLACE FUNCTION update_daily_analytics()
RETURNS void AS $$
DECLARE
  today DATE := CURRENT_DATE;
BEGIN
  INSERT INTO site_analytics (
    date,
    total_page_views,
    unique_visitors,
    online_users_peak,
    new_users,
    active_users
  )
  VALUES (
    today,
    (SELECT COUNT(*) FROM page_views WHERE DATE(viewed_at) = today),
    (SELECT COUNT(DISTINCT user_id) FROM page_views WHERE DATE(viewed_at) = today),
    (SELECT COUNT(*) FROM online_users),
    (SELECT COUNT(*) FROM user_profiles WHERE DATE(created_at) = today),
    (SELECT COUNT(DISTINCT user_id) FROM page_views WHERE viewed_at > NOW() - INTERVAL '24 hours')
  )
  ON CONFLICT (date) 
  DO UPDATE SET
    total_page_views = EXCLUDED.total_page_views,
    unique_visitors = EXCLUDED.unique_visitors,
    online_users_peak = GREATEST(site_analytics.online_users_peak, EXCLUDED.online_users_peak),
    active_users = EXCLUDED.active_users;
END;
$$ LANGUAGE plpgsql;

-- Policies RLS
ALTER TABLE site_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_users ENABLE ROW LEVEL SECURITY;

-- Admins peuvent tout voir
CREATE POLICY admin_view_analytics ON site_analytics FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.is_admin = true
  ));

CREATE POLICY admin_view_page_views ON page_views FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.is_admin = true
  ));

CREATE POLICY admin_view_online_users ON online_users FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.is_admin = true
  ));

-- Les utilisateurs peuvent insérer leurs propres vues
CREATE POLICY users_insert_page_views ON page_views FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent mettre à jour leur statut en ligne
CREATE POLICY users_manage_online_status ON online_users FOR ALL
  USING (auth.uid() = user_id);
