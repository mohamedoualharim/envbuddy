const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

// Example Supabase JWT token - Replace with a real token from Supabase Auth
// You can get this by:
// 1. Creating a user in Supabase Auth
// 2. Logging in via Supabase client
// 3. Getting the access token from the session
const EXAMPLE_JWT_TOKEN = 'your-jwt-token-here';

async function testAuthenticatedAPI() {
  console.log('🧪 Testing EnvBuddy API with Authentication...\n');

  // Test without authentication (should fail)
  console.log('1. Testing without authentication (should fail)...');
  try {
    await axios.get(`${API_BASE_URL}/api/projects`);
    console.log('❌ Unexpected: Request succeeded without auth');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ Correctly rejected: No authorization header');
      console.log(`   Message: ${error.response.data.message}`);
    } else {
      console.log('❌ Unexpected error:', error.message);
    }
  }
  console.log('');

  // Test with invalid token format
  console.log('2. Testing with invalid token format (should fail)...');
  try {
    await axios.get(`${API_BASE_URL}/api/projects`, {
      headers: {
        'Authorization': 'InvalidFormat token'
      }
    });
    console.log('❌ Unexpected: Request succeeded with invalid format');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ Correctly rejected: Invalid authorization header format');
      console.log(`   Message: ${error.response.data.message}`);
    } else {
      console.log('❌ Unexpected error:', error.message);
    }
  }
  console.log('');

  // Test with fake/invalid JWT token
  console.log('3. Testing with invalid JWT token (should fail)...');
  try {
    await axios.get(`${API_BASE_URL}/api/projects`, {
      headers: {
        'Authorization': 'Bearer invalid.jwt.token'
      }
    });
    console.log('❌ Unexpected: Request succeeded with invalid token');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ Correctly rejected: Invalid or expired token');
      console.log(`   Message: ${error.response.data.message}`);
    } else {
      console.log('❌ Unexpected error:', error.message);
    }
  }
  console.log('');

  // Test with valid token (if provided)
  if (EXAMPLE_JWT_TOKEN !== 'your-jwt-token-here') {
    console.log('4. Testing with valid JWT token...');
    try {
      // Common headers for authenticated requests
      const authHeaders = {
        'Authorization': `Bearer ${EXAMPLE_JWT_TOKEN}`,
        'Content-Type': 'application/json'
      };

      // Create a project
      console.log('   a. Creating a project...');
      const createResponse = await axios.post(`${API_BASE_URL}/api/projects`, {
        name: 'test-authenticated-project'
      }, { headers: authHeaders });
      console.log('   ✅ Project created:', createResponse.data.data);
      const projectId = createResponse.data.data.id;

      // Get all projects
      console.log('   b. Getting all projects...');
      const projectsResponse = await axios.get(`${API_BASE_URL}/api/projects`, {
        headers: authHeaders
      });
      console.log(`   ✅ Found ${projectsResponse.data.count} project(s)`);

      // Push environment variables
      console.log('   c. Pushing environment variables...');
      const pushResponse = await axios.post(`${API_BASE_URL}/api/env/push`, {
        projectId,
        environment: 'development',
        variables: {
          API_KEY: 'test_key_123',
          DATABASE_URL: 'postgres://test'
        }
      }, { headers: authHeaders });
      console.log('   ✅ Variables pushed:', pushResponse.data.data);

      // Export variables
      console.log('   d. Exporting environment variables...');
      const exportResponse = await axios.get(
        `${API_BASE_URL}/api/env/export/${projectId}/development`,
        { headers: authHeaders }
      );
      console.log('   ✅ Exported content (preview):');
      console.log('   ' + exportResponse.data.substring(0, 100) + '...');

      // Clean up - delete the project
      console.log('   e. Cleaning up - deleting project...');
      await axios.delete(`${API_BASE_URL}/api/projects/${projectId}`, {
        headers: authHeaders
      });
      console.log('   ✅ Project deleted');

    } catch (error) {
      console.error('❌ Error with authenticated request:', error.response?.data || error.message);
    }
  } else {
    console.log('4. Skipping authenticated tests (no token provided)');
    console.log('   To test with authentication:');
    console.log('   1. Create a user in Supabase Dashboard');
    console.log('   2. Get a JWT token using Supabase Auth');
    console.log('   3. Replace EXAMPLE_JWT_TOKEN in this script');
  }

  console.log('\n📝 Authentication Test Summary:');
  console.log('- All routes now require authentication');
  console.log('- Use Bearer token in Authorization header');
  console.log('- Token is verified with Supabase Auth');
  console.log('- User ID is automatically extracted from token');
  console.log('- Projects are automatically assigned to authenticated user');
}

// Check if axios is installed
try {
  require.resolve('axios');
  testAuthenticatedAPI();
} catch (e) {
  console.log('Installing axios for testing...');
  require('child_process').execSync('npm install axios', { stdio: 'inherit' });
  console.log('Please run this script again.');
} 