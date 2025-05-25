-- EnvBuddy Database Schema
-- Run this migration to set up all required tables

-- 1. Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);

-- 2. Create env_files table
CREATE TABLE IF NOT EXISTS env_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  environment VARCHAR(50) DEFAULT 'development',
  file_name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  variables JSONB,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_env_files_project_id ON env_files(project_id);
CREATE INDEX IF NOT EXISTS idx_env_files_environment ON env_files(environment);

-- 3. Create env_vars table (for individual variables)
CREATE TABLE IF NOT EXISTS env_vars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  environment VARCHAR(50) NOT NULL DEFAULT 'development',
  key VARCHAR(255) NOT NULL,
  value TEXT,
  batch_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, environment, key)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_env_vars_project_id ON env_vars(project_id);
CREATE INDEX IF NOT EXISTS idx_env_vars_environment ON env_vars(environment);
CREATE INDEX IF NOT EXISTS idx_env_vars_batch_id ON env_vars(batch_id);
CREATE INDEX IF NOT EXISTS idx_env_vars_project_env ON env_vars(project_id, environment);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE env_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE env_vars ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for projects table
-- Users can view their own projects
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT
  USING (auth.uid() = owner_id);

-- Users can insert their own projects
CREATE POLICY "Users can create own projects" ON projects
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Users can update their own projects
CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE
  USING (auth.uid() = owner_id);

-- Users can delete their own projects
CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE
  USING (auth.uid() = owner_id);

-- 6. Create RLS policies for env_files table
-- Users can view env_files for their projects
CREATE POLICY "Users can view env_files for own projects" ON env_files
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = env_files.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- Users can insert env_files for their projects
CREATE POLICY "Users can create env_files for own projects" ON env_files
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = env_files.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- Users can update env_files for their projects
CREATE POLICY "Users can update env_files for own projects" ON env_files
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = env_files.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- Users can delete env_files for their projects
CREATE POLICY "Users can delete env_files for own projects" ON env_files
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = env_files.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- 7. Create RLS policies for env_vars table
-- Users can view env_vars for their projects
CREATE POLICY "Users can view env_vars for own projects" ON env_vars
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = env_vars.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- Users can insert env_vars for their projects
CREATE POLICY "Users can create env_vars for own projects" ON env_vars
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = env_vars.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- Users can update env_vars for their projects
CREATE POLICY "Users can update env_vars for own projects" ON env_vars
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = env_vars.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- Users can delete env_vars for their projects
CREATE POLICY "Users can delete env_vars for own projects" ON env_vars
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = env_vars.project_id
      AND projects.owner_id = auth.uid()
    )
  ); 