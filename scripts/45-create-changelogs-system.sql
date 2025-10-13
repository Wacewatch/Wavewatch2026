-- Create changelogs table for version history
CREATE TABLE IF NOT EXISTS public.changelogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  release_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_changelogs_release_date ON public.changelogs(release_date DESC);
CREATE INDEX IF NOT EXISTS idx_changelogs_created_by ON public.changelogs(created_by);

-- Enable RLS
ALTER TABLE public.changelogs ENABLE ROW LEVEL SECURITY;

-- Public can read changelogs
CREATE POLICY "Anyone can view changelogs"
  ON public.changelogs
  FOR SELECT
  USING (true);

-- Only admins can insert/update/delete changelogs
CREATE POLICY "Admins can insert changelogs"
  ON public.changelogs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can update changelogs"
  ON public.changelogs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can delete changelogs"
  ON public.changelogs
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Add some sample changelogs
INSERT INTO public.changelogs (version, title, description, release_date) VALUES
  ('1.0.0', 'Lancement Initial', 'Bienvenue sur WaveWatch ! Cette première version inclut :
  
• Catalogue complet de films, séries et animés
• Chaînes TV en direct
• Stations radio FM
• Section retrogaming
• Système de playlists personnalisées
• Profils utilisateurs avec historique
• Mode VIP avec avantages exclusifs', NOW() - INTERVAL '30 days'),
  
  ('1.1.0', 'Système de Badges', 'Nouvelle fonctionnalité : Système de succès et badges !
  
• Plus de 40 badges à débloquer
• Défis dans toutes les catégories
• Suivi de progression
• Récompenses VIP pour les meilleurs', NOW() - INTERVAL '7 days'),
  
  ('1.2.0', 'Améliorations Interface', 'Améliorations de l''expérience utilisateur :
  
• Nouveau design du hero avec titres stylisés
• Icônes de raccourci sur les jaquettes
• Messagerie améliorée
• Page de demandes redessinée
• Corrections de bugs divers', NOW());
