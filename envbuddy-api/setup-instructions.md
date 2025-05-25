# EnvBuddy API Setup Instructions

## Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Node.js**: Version 14 or higher
3. **npm**: Comes with Node.js

## Environment Variables Setup

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Get your Supabase credentials:**
   - Go to your Supabase project dashboard
   - Navigate to Settings → API
   - Copy the following values:
     - `Project URL` → `SUPABASE_URL`
     - `anon public` key → `SUPABASE_ANON_KEY`  
     - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

3. **Update your .env file:**
   ```env
   # Supabase Configuration
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

   # Server Configuration
   PORT=3000
   NODE_ENV=development
   ```

## Database Setup

1. **Run the main database migration:**
   - Go to your Supabase project dashboard
   - Click on **SQL Editor** in the left sidebar
   - Copy the entire content from `database/migrations/001_create_tables.sql`
   - Paste it into the SQL Editor
   - Click **Run**

2. **What this creates:**
   - `projects` table - Stores project information
   - `env_files` table - Stores complete .env files
   - `env_vars` table - Stores individual environment variables
   - All necessary indexes for performance
   - Row Level Security (RLS) policies for data isolation

3. **For existing data (optional):**
   - If you have existing data to migrate, review `database/migrations/002_migrate_existing_data.sql`
   - This script helps migrate from string project IDs to UUID references
   - Only run this if you have pre-existing data

## Running the API

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Test the API:**
   ```bash
   curl http://localhost:3000/health
   ```

## Authentication Setup

1. **Create a user in Supabase:**
   - Go to Authentication → Users
   - Click "Add user"
   - Create a user with email/password

2. **Get a JWT token:**
   ```javascript
   // Using Supabase client
   const { data } = await supabase.auth.signInWithPassword({
     email: 'user@example.com',
     password: 'password'
   });
   console.log(data.session.access_token);
   ```

3. **Use the token with the CLI:**
   ```bash
   envbuddy login
   # Paste your JWT token when prompted
   ```

## Troubleshooting

### API won't start
- Check all environment variables are set correctly
- Ensure Supabase project is active
- Verify Node.js version: `node --version`

### Authentication errors
- Token might be expired - get a new one
- Check SUPABASE_URL format (should include https://)
- Ensure anon key is correct

### Database errors
- Run all migrations in order
- Check RLS policies are enabled
- Verify service role key has proper permissions 