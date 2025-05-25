# EnvBuddy CLI

A command-line tool for managing environment files with the EnvBuddy API.

## Installation

### Global Installation
```bash
npm install -g .
```

### Local Installation
```bash
npm link
```

## Quick Start

1. **Initialize the CLI with your API configuration:**
   ```bash
   envbuddy init
   ```

2. **Authenticate with your Supabase JWT token:**
   ```bash
   envbuddy login
   ```

3. **Push environment variables (auto-selects project if needed):**
   ```bash
   envbuddy push .env
   ```

4. **Pull environment variables:**
   ```bash
   envbuddy pull-vars
   ```

## Project Selection

The CLI now automatically prompts for project selection when needed:

### Automatic Project Selection
When you run `push` or `pull-vars` without a default project set, the CLI will:
1. Fetch all your available projects
2. Show an interactive selection menu
3. Ask if you want to save it as default
4. Continue with the original command

**Example:**
```bash
$ envbuddy push .env
⚠️  No default project set

📋 Fetching your projects...

? Select a project: (Use arrow keys)
❯ my-awesome-app (123e4567-e89b-12d3-a456-426614174000)
  another-project (987f6543-e21b-45d6-b789-123456789012)
  test-project (456a7890-f12c-34d5-e678-901234567890)

? Save as default project? Yes
✅ Default project set: my-awesome-app

📤 Pushing .env to project my-awesome-app...
```

### Manual Project Selection
You can still manually set a default project:
```bash
envbuddy project my-project-id
```

Or use the `-p` flag to override for a single command:
```bash
envbuddy push -p another-project-id
```

## Authentication

The CLI requires authentication to interact with the API. You need a JWT token from Supabase Auth.

### Getting a JWT Token

1. **Using Supabase Dashboard:**
   - Go to your Supabase project
   - Create a user in Authentication → Users
   - Use the Supabase client to sign in and get the token

2. **Using Supabase Client:**
   ```javascript
   const { data } = await supabase.auth.signInWithPassword({
     email: 'user@example.com',
     password: 'password'
   });
   console.log(data.session.access_token); // This is your JWT token
   ```

### Authentication Commands

#### `envbuddy login`
Authenticate with your Supabase JWT token.
- Prompts for your JWT token (hidden input)
- Verifies the token with the API
- Saves the token securely in `~/.envbuddy/config.json`
- Shows authentication status

#### `envbuddy logout`
Log out and remove saved authentication.
- Removes the stored token
- Confirms before logging out

## Commands

### `envbuddy init`
Initialize the CLI with API configuration. This command will prompt you for:
- API URL (default: http://localhost:3000)
- Default project ID (optional)

### `envbuddy create`
Create a new project.
- Requires authentication
- Prompts for project name
- Validates project name (letters, numbers, hyphens, underscores)
- Option to set as default project
- Shows next steps after creation

**Example:**
```bash
envbuddy create
# Enter project name: my-awesome-app
# Set as default? Yes
# ✅ Project created and selected: my-awesome-app
```

### `envbuddy project <projectId>`
Set the default project ID for all commands.

```bash
envbuddy project my-awesome-project
```

### `envbuddy push [file]`
Push environment variables to the server. This command:
- Requires authentication
- Reads and parses a .env file locally
- Sends variables as JSON to the `/api/env/push` endpoint
- Updates existing variables and adds new ones

**Options:**
- `-p, --project <projectId>` - Override default project ID
- `-e, --environment <env>` - Environment name (default: development)
- `-d, --description <desc>` - Description for tracking

**Examples:**
```bash
# Push .env file (default)
envbuddy push

# Push a specific file
envbuddy push .env.production

# Push with environment
envbuddy push -e production

# Push to a different project
envbuddy push -p another-project -e staging
```

### `envbuddy pull-vars`
Pull environment variables from the server (from env_vars table).
- Requires authentication
- Downloads variables as a .env file

**Options:**
- `-p, --project <projectId>` - Override default project ID
- `-e, --environment <env>` - Environment name (default: development)
- `-o, --output <file>` - Output file name (default: .env)
- `-f, --force` - Overwrite existing file without prompt

**Examples:**
```bash
# Pull development variables (default)
envbuddy pull-vars

# Pull production variables
envbuddy pull-vars -e production

# Pull to a specific file
envbuddy pull-vars -e staging -o .env.staging
```

### `envbuddy list` (alias: `ls`)
List your projects or environment files.
- Requires authentication
- Shows all your projects if no project is specified
- Shows env files if a project is specified

**Options:**
- `-p, --project <projectId>` - Show files for specific project
- `-e, --environment <env>` - Filter by environment

**Examples:**
```bash
# List all your projects
envbuddy list

# List files for a specific project
envbuddy list -p my-project

# List production files only
envbuddy list -p my-project -e production
```

## Configuration

The CLI stores configuration in `~/.envbuddy/config.json`:

```json
{
  "apiUrl": "http://localhost:3000",
  "projectId": "my-default-project",
  "token": "your-jwt-token"  // Added after login
}
```

**Security Note:** The token is stored in plain text. Ensure your home directory has appropriate permissions.

## Error Handling

### Authentication Errors
- **No token:** Commands will prompt you to run `envbuddy login`
- **Invalid token:** You'll be asked to log in again
- **Expired token:** The CLI will show an error and suggest re-authentication

### Common Issues

1. **"Not authenticated"**
   ```bash
   envbuddy login
   ```

2. **"Token expired or invalid"**
   ```bash
   envbuddy logout
   envbuddy login
   ```

3. **"Project not found"**
   - Check your projects: `envbuddy list`
   - Ensure you're using the correct project ID

## Complete Workflow Example

```bash
# 1. Initialize CLI
envbuddy init

# 2. Login with your JWT token
envbuddy login
# Enter your token when prompted

# 3. Create a new project
envbuddy create
# Enter project name: my-app
# Set as default? Yes

# 4. Push local .env to development
envbuddy push .env -e development

# 5. Push production env
envbuddy push .env.production -e production

# 6. On another machine, login and pull
envbuddy login
envbuddy pull-vars -e production -o .env
```

## Security Best Practices

1. **Token Security:**
   - Never share your JWT token
   - Tokens expire - re-login when needed
   - Use `envbuddy logout` on shared machines

2. **File Permissions:**
   - Config file is stored in your home directory
   - Ensure `~/.envbuddy/` has appropriate permissions

3. **Environment Variables:**
   - Use different tokens for different environments
   - Rotate tokens regularly

## Troubleshooting

### Cannot connect to API
- Ensure your API server is running
- Check the API URL: `cat ~/.envbuddy/config.json`
- Run `envbuddy init` to update the URL

### Authentication issues
- Verify your token is valid in Supabase Dashboard
- Ensure the API has `SUPABASE_URL` configured
- Try logging out and back in

## License

ISC 