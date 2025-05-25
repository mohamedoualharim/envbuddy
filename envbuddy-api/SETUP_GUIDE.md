# EnvBuddy API - Setup Guide

## ⚡ Quick Setup

### 1. Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (remember your database password!)
3. Once project is ready, go to **Settings → API**
4. You'll need these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public** key: `eyJhbGc...` (long string)
   - **service_role** key: `eyJhbGc...` (different long string - keep secret!)

### 2. Configure Environment

Edit the `.env` file (already created) and replace the placeholder values:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 3. Set Up Database

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** (left sidebar)
3. Copy the entire content from `database/migrations/001_create_tables.sql`
4. Paste it into the SQL Editor and click **Run**
   
   This will create:
   - `projects` table
   - `env_files` table
   - `env_vars` table
   - All necessary indexes
   - Row Level Security (RLS) policies

   **Note:** The `002_migrate_existing_data.sql` file is only needed if you have existing data to migrate.

### 4. Start the API

```bash
# Install dependencies (if not done yet)
npm install

# Start the server
npm run dev
```

You should see:
```
Server running on port 3000
Connected to Supabase
```

### 5. Test It

```bash
# In a new terminal
curl http://localhost:3000/health
```

Should return: `{"status":"ok","timestamp":"..."}`

## 🎉 Success!

Your EnvBuddy API is now running! Next steps:
- Create a user in Supabase Authentication
- Use the CLI to interact with your API
- Check out the [CLI README](./cli/README.md) for usage

## 🔧 Troubleshooting

**"Missing Supabase environment variables"**
- Make sure your `.env` file has all three required values
- Check there are no extra spaces or quotes in the values

**"Connection refused"**
- Make sure Supabase project is active (not paused)
- Verify the SUPABASE_URL is correct (includes https://) 