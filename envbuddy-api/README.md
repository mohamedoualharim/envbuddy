# EnvBuddy API

A secure API for managing environment variables across projects and teams, built with Node.js, Express, and Supabase.

## 🚀 Quick Start

1. **Set up Supabase:**
   - Create a free account at [supabase.com](https://supabase.com)
   - Create a new project
   - Go to Settings → API and copy your credentials

2. **Configure environment:**
   ```bash
   # Create .env file
   node create-env.js
   
   # Edit .env and add your Supabase credentials
   ```

3. **Set up database:**
   - Go to Supabase SQL Editor
   - Run migration files in order from `migrations/` folder

4. **Start the server:**
   ```bash
   npm install
   npm run dev
   ```

For detailed setup instructions, see [setup-instructions.md](./setup-instructions.md).

## Features

- Upload and store .env files securely
- Push individual environment variables to a dedicated table
- Retrieve environment files by project
- Update existing environment files
- Delete environment files
- Download environment files
- Parse and store environment variables as JSON

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account and project

## Setup

### 1. Clone the repository and install dependencies

```bash
cd envbuddy-api
npm install
```

### 2. Set up Supabase

1. Create a new project on [Supabase](https://supabase.com)
2. Create the required tables with the following schemas:

#### projects table
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
```

#### env_files table
```sql
CREATE TABLE env_files (
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
CREATE INDEX idx_env_files_project_id ON env_files(project_id);
CREATE INDEX idx_env_files_environment ON env_files(environment);
```

#### env_vars table (for individual variables)
```sql
CREATE TABLE env_vars (
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
CREATE INDEX idx_env_vars_project_id ON env_vars(project_id);
CREATE INDEX idx_env_vars_environment ON env_vars(environment);
CREATE INDEX idx_env_vars_batch_id ON env_vars(batch_id);
CREATE INDEX idx_env_vars_project_env ON env_vars(project_id, environment);
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key  # Required for push endpoint

# Server Configuration
PORT=3000
NODE_ENV=development
```

You can find your Supabase URL, anon key, and service role key in your Supabase project settings.

### 4. Set up Authentication

The API uses Supabase Auth for authentication. All routes (except `/health`) require authentication.

1. **Enable Authentication in Supabase:**
   - Go to your Supabase Dashboard
   - Navigate to Authentication → Settings
   - Enable your preferred auth providers (Email, Google, GitHub, etc.)

2. **Create test users:**
   - Use Supabase Dashboard or client SDK to create users
   - Users will automatically get JWT tokens when they sign in

### 5. Run the application

For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

## Authentication

All API endpoints (except `/health`) require authentication using JWT tokens from Supabase Auth.

### How to Authenticate

1. **Get a JWT token** by signing in through Supabase Auth:
   ```javascript
   // Using Supabase client SDK
   const { data, error } = await supabase.auth.signInWithPassword({
     email: 'user@example.com',
     password: 'password'
   });
   const token = data.session.access_token;
   ```

2. **Include the token** in the Authorization header:
   ```bash
   Authorization: Bearer <your-jwt-token>
   ```

3. **Example authenticated request:**
   ```bash
   curl -H "Authorization: Bearer <your-jwt-token>" \
        http://localhost:3000/api/projects
   ```

### Authentication Flow

1. Client sends request with `Authorization: Bearer <token>` header
2. `authenticateUser` middleware verifies the token with Supabase
3. On success, `req.userId` is set to the user's ID
4. Controllers use `req.userId` to filter/create resources
5. On failure, returns 401 Unauthorized

### Testing Authentication

Use the provided test script:
```bash
node test-auth-api.js
```

This script demonstrates:
- Requests without authentication (rejected)
- Invalid token formats (rejected)
- Invalid tokens (rejected)
- Valid authenticated requests (when you provide a real token)

## API Endpoints

### Health Check
- **GET** `/health` - Check if the API is running

### Projects

#### Create a new project
- **POST** `/api/projects`
- **JSON Body:**
  - `name` (string, required): Project name
  - `ownerId` (string, optional): Owner's user ID

#### Get all projects
- **GET** `/api/projects`
- **Query Parameters:**
  - `ownerId` (string, optional): Filter by owner

#### Get a project by ID
- **GET** `/api/projects/:id`

#### Get a project by name
- **GET** `/api/projects/name/:name`

#### Update a project
- **PUT** `/api/projects/:id`
- **JSON Body:**
  - `name` (string, required): New project name

#### Delete a project
- **DELETE** `/api/projects/:id`
- Note: This will cascade delete all associated env_files and env_vars

### Environment Files

#### Upload an environment file
- **POST** `/api/env/upload`
- **Form Data:**
  - `envFile` (file): The .env file to upload
  - `projectId` (string): The project identifier
  - `environment` (string, optional): Environment name (default: 'development')
  - `description` (string, optional): Description of the env file

#### Push environment variables
- **POST** `/api/env/push`
- **JSON Body:**
  - `projectId` (string): The project identifier
  - `environment` (string, optional): Environment name (default: 'development')
  - `variables` (object): Key-value pairs of environment variables

**Example:**
```json
{
  "projectId": "my-project",
  "environment": "production",
  "variables": {
    "DATABASE_URL": "postgres://...",
    "API_KEY": "sk_test_...",
    "NODE_ENV": "production"
  }
}
```

#### Get environment variables
- **GET** `/api/env/vars/:projectId/:environment?`
- Returns individual variables from the env_vars table

#### Get all environment files for a project
- **GET** `/api/env/project/:projectId`
- **Query Parameters:**
  - `environment` (string, optional): Filter by environment

#### Get a specific environment file
- **GET** `/api/env/:id`

#### Update an environment file
- **PUT** `/api/env/:id`
- **Form Data:**
  - `envFile` (file, optional): New .env file
  - `environment` (string, optional): Update environment name
  - `description` (string, optional): Update description

#### Delete an environment file
- **DELETE** `/api/env/:id`

#### Download environment file
- **GET** `/api/env/:id/download`

## Database Migration

If you have existing data with string project IDs, follow these steps:

1. **Run the initial schema creation**:
   ```sql
   -- Run the SQL from database/migrations/001_create_tables.sql
   ```

2. **For existing data**, you have two options:

   **Option A: Start fresh** (recommended for development)
   - Simply run the schema creation and start using UUID project IDs

   **Option B: Migrate existing data**
   - Review and adjust `database/migrations/002_migrate_existing_data.sql`
   - This script will:
     - Create projects from existing project ID strings
     - Update foreign key references
     - Preserve your existing data
   - Note: You'll need to manually assign `owner_id` values after migration

3. **Update your application**:
   - When creating env_files or env_vars, use the UUID from the projects table
   - Update any existing code that uses string project IDs

## Example Usage with Authentication

### Create a project first:

```bash
# Get your JWT token from Supabase Auth first
TOKEN="your-jwt-token"

curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "my-awesome-project"
  }'

# Response will include the project ID (UUID)
```

### Then use the project ID for environment operations:

```bash
# Push variables using the project UUID
curl -X POST http://localhost:3000/api/env/push \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "projectId": "uuid-from-projects-table",
    "environment": "production",
    "variables": {
      "DATABASE_URL": "postgres://...",
      "API_KEY": "sk_test_..."
    }
  }'
```

### Upload an environment file using curl:

```bash
curl -X POST http://localhost:3000/api/env/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "envFile=@.env" \
  -F "projectId=uuid-from-projects-table" \
  -F "environment=production" \
  -F "description=Production environment variables"
```

### Push individual environment variables:

```bash
curl -X POST http://localhost:3000/api/env/push \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "my-project",
    "environment": "production",
    "variables": {
      "DATABASE_URL": "postgres://user:pass@host:5432/db",
      "API_KEY": "sk_test_123",
      "DEBUG": "false"
    }
  }'
```

### Get environment variables:

```bash
# Get all variables for a project
curl http://localhost:3000/api/env/vars/my-project

# Get variables for a specific environment
curl http://localhost:3000/api/env/vars/my-project/production
```

### Get all environment files for a project:

```bash
curl http://localhost:3000/api/env/project/my-project
```

### Download an environment file:

```bash
curl http://localhost:3000/api/env/{file-id}/download -o .env
```

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

Error responses include a JSON object with an `error` field and optional `details`.

## Security Considerations

1. Always use HTTPS in production
2. **Authentication is required** for all data endpoints
3. **User isolation**: Users can only access their own projects and data
4. Consider encrypting sensitive environment variables
5. Use Row Level Security (RLS) in Supabase for additional protection
6. Implement rate limiting to prevent abuse
7. The service role key should be kept secure and only used server-side
8. **Token security**: Never expose JWT tokens in logs or error messages

## License

ISC 