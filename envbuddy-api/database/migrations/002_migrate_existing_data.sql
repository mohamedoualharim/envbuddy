-- Migration script for existing data
-- This script helps migrate from string project_id to UUID references

-- IMPORTANT: This is a template. Adjust based on your existing data.

-- Step 1: Create temporary columns to store old string project IDs
ALTER TABLE env_files ADD COLUMN IF NOT EXISTS old_project_id VARCHAR(255);
ALTER TABLE env_vars ADD COLUMN IF NOT EXISTS old_project_id VARCHAR(255);

-- Step 2: Copy existing project_id values to old_project_id
UPDATE env_files SET old_project_id = project_id::text WHERE old_project_id IS NULL;
UPDATE env_vars SET old_project_id = project_id::text WHERE old_project_id IS NULL;

-- Step 3: Create projects for existing unique project IDs
-- Note: This creates projects without owners. You'll need to assign owners manually.
INSERT INTO projects (id, name, owner_id, created_at)
SELECT 
  gen_random_uuid() as id,
  DISTINCT old_project_id as name,
  NULL as owner_id, -- You need to set this based on your auth setup
  NOW() as created_at
FROM (
  SELECT DISTINCT old_project_id FROM env_files
  UNION
  SELECT DISTINCT old_project_id FROM env_vars
) unique_projects
WHERE old_project_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Step 4: Update env_files and env_vars with the new UUID project_id
UPDATE env_files ef
SET project_id = p.id
FROM projects p
WHERE ef.old_project_id = p.name;

UPDATE env_vars ev
SET project_id = p.id
FROM projects p
WHERE ev.old_project_id = p.name;

-- Step 5: Verify migration
-- Check if any records weren't migrated
SELECT 'env_files not migrated:', COUNT(*) 
FROM env_files 
WHERE project_id IS NULL AND old_project_id IS NOT NULL;

SELECT 'env_vars not migrated:', COUNT(*) 
FROM env_vars 
WHERE project_id IS NULL AND old_project_id IS NOT NULL;

-- Step 6: After verification, drop the temporary columns
-- ONLY RUN THESE AFTER CONFIRMING MIGRATION SUCCESS!
-- ALTER TABLE env_files DROP COLUMN old_project_id;
-- ALTER TABLE env_vars DROP COLUMN old_project_id;

-- Note: You'll need to manually assign owner_id in the projects table
-- based on your authentication setup. For example:
-- UPDATE projects SET owner_id = 'your-user-uuid' WHERE name = 'project-name'; 