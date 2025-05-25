const fs = require('fs');
const path = require('path');

const envExample = `# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration (optional)
CORS_ORIGIN=http://localhost:3000`;

const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

// Create .env.example if it doesn't exist
if (!fs.existsSync(envExamplePath)) {
  fs.writeFileSync(envExamplePath, envExample);
  console.log('✅ Created .env.example file');
}

// Create .env if it doesn't exist
if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envExample);
  console.log('✅ Created .env file');
  console.log('\n⚠️  Please update the .env file with your actual Supabase credentials:');
  console.log('   1. Go to your Supabase project dashboard');
  console.log('   2. Navigate to Settings → API');
  console.log('   3. Copy your project URL and keys');
  console.log('   4. Update the values in .env\n');
} else {
  console.log('ℹ️  .env file already exists');
}

console.log('📋 Required environment variables:');
console.log('   - SUPABASE_URL');
console.log('   - SUPABASE_ANON_KEY');
console.log('   - SUPABASE_SERVICE_ROLE_KEY\n'); 