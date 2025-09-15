-- Create user_profiles_extended table for additional profile information
CREATE TABLE IF NOT EXISTS public.user_profiles_extended (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  birth_date DATE,
  location TEXT,
  bio TEXT,
  profile_image TEXT,
  join_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_profiles_extended ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own extended profile" ON public.user_profiles_extended
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own extended profile" ON public.user_profiles_extended
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own extended profile" ON public.user_profiles_extended
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own extended profile" ON public.user_profiles_extended
  FOR DELETE USING (auth.uid() = user_id);

-- Create bug_reports table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.bug_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
  content_title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for bug_reports
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for bug_reports
CREATE POLICY "Users can view their own bug reports" ON public.bug_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bug reports" ON public.bug_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all bug reports" ON public.bug_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can update all bug reports" ON public.bug_reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );
