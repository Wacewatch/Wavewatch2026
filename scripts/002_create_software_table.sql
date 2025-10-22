-- Create software table for managing software downloads
CREATE TABLE IF NOT EXISTS software (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  developer VARCHAR(255),
  description TEXT,
  icon_url TEXT,
  download_url TEXT,
  version VARCHAR(50),
  release_date DATE,
  category VARCHAR(100), -- Productivity, Development, Design, Security, etc.
  platform VARCHAR(100), -- Windows, macOS, Linux, Cross-platform
  license VARCHAR(50), -- Free, Freemium, Open Source, Trial
  file_size VARCHAR(50), -- e.g., "150 MB"
  downloads INTEGER DEFAULT 0,
  rating DECIMAL(2,1), -- 0.0 to 5.0
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_software_category ON software(category);
CREATE INDEX IF NOT EXISTS idx_software_platform ON software(platform);
CREATE INDEX IF NOT EXISTS idx_software_active ON software(is_active);

-- Enable Row Level Security
ALTER TABLE software ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view active software
CREATE POLICY "Anyone can view active software"
  ON software
  FOR SELECT
  USING (is_active = true);

-- Policy: Only admins can insert software
CREATE POLICY "Admins can insert software"
  ON software
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Policy: Only admins can update software
CREATE POLICY "Admins can update software"
  ON software
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Policy: Only admins can delete software
CREATE POLICY "Admins can delete software"
  ON software
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
