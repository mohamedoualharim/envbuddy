const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

// Create sample .env content
const sampleEnvContent = `# Database Configuration
DATABASE_URL=postgres://user:password@localhost:5432/mydb
DATABASE_NAME=mydb
DATABASE_HOST=localhost
DATABASE_PORT=5432

# API Keys
API_KEY=sk_test_1234567890
SECRET_KEY=secret_key_here
WEBHOOK_SECRET=whsec_test_secret

# Application Settings
NODE_ENV=production
PORT=3000
DEBUG=false
LOG_LEVEL=info

# External Services
REDIS_URL=redis://localhost:6379
ELASTICSEARCH_URL=http://localhost:9200
RABBITMQ_URL=amqp://localhost
`;

async function testPushAPI() {
  try {
    console.log('🧪 Testing EnvBuddy Push API...\n');

    const projectId = 'test-push-project';

    // 1. Test push with JSON body
    console.log('1. Testing push with JSON body...');
    const jsonPushResponse = await axios.post(`${API_BASE_URL}/api/env/push`, {
      projectId,
      environment: 'development',
      variables: {
        API_KEY: 'dev_api_key_123',
        DATABASE_URL: 'postgres://dev:devpass@localhost:5432/devdb',
        NODE_ENV: 'development',
        DEBUG: 'true'
      }
    });
    console.log('✅ JSON Push response:', jsonPushResponse.data);
    console.log('');

    // 2. Create and push a test .env file
    console.log('2. Creating and pushing test.env file...');
    fs.writeFileSync('test-push.env', sampleEnvContent);

    const form = new FormData();
    form.append('envFile', fs.createReadStream('test-push.env'));
    form.append('projectId', projectId);
    form.append('environment', 'production');

    const filePushResponse = await axios.post(`${API_BASE_URL}/api/env/push`, form, {
      headers: form.getHeaders()
    });
    console.log('✅ File Push response:', filePushResponse.data);
    console.log('');

    // 3. Get variables for development environment
    console.log('3. Getting variables for development environment...');
    const devVarsResponse = await axios.get(`${API_BASE_URL}/api/env/vars/${projectId}/development`);
    console.log('✅ Development variables:');
    if (devVarsResponse.data.data && Array.isArray(devVarsResponse.data.data)) {
      devVarsResponse.data.data.forEach(v => {
        console.log(`   ${v.key} = ${v.value.substring(0, 30)}${v.value.length > 30 ? '...' : ''}`);
      });
    }
    console.log('');

    // 4. Get variables for production environment
    console.log('4. Getting variables for production environment...');
    const prodVarsResponse = await axios.get(`${API_BASE_URL}/api/env/vars/${projectId}/production`);
    console.log('✅ Production variables:');
    if (prodVarsResponse.data.data && Array.isArray(prodVarsResponse.data.data)) {
      prodVarsResponse.data.data.forEach(v => {
        console.log(`   ${v.key} = ${v.value.substring(0, 30)}${v.value.length > 30 ? '...' : ''}`);
      });
    }
    console.log('');

    // 5. Get all variables grouped by environment
    console.log('5. Getting all variables for project...');
    const allVarsResponse = await axios.get(`${API_BASE_URL}/api/env/vars/${projectId}`);
    console.log('✅ All variables by environment:', Object.keys(allVarsResponse.data.data));
    console.log('');

    // 6. Export production variables as .env file
    console.log('6. Exporting production variables as .env file...');
    const exportResponse = await axios.get(`${API_BASE_URL}/api/env/export/${projectId}/production`);
    console.log('✅ Exported .env content preview:');
    console.log(exportResponse.data.substring(0, 200) + '...');
    console.log('');

    // 7. Update existing variables (push again with some changes)
    console.log('7. Updating existing variables...');
    const updateResponse = await axios.post(`${API_BASE_URL}/api/env/push`, {
      projectId,
      environment: 'development',
      variables: {
        API_KEY: 'updated_dev_api_key_456',  // Updated
        DATABASE_URL: 'postgres://dev:newpass@localhost:5432/devdb',  // Updated
        NEW_VARIABLE: 'this_is_new',  // New
        NODE_ENV: 'development',  // Same
        DEBUG: 'true'  // Same
      }
    });
    console.log('✅ Update response:', updateResponse.data);

    // Clean up
    fs.unlinkSync('test-push.env');
    console.log('\n✅ All push API tests completed successfully!');
    
    console.log('\n📝 Summary:');
    console.log('- Pushed variables via JSON body');
    console.log('- Pushed variables via .env file upload');
    console.log('- Retrieved variables by environment');
    console.log('- Exported variables as .env file');
    console.log('- Updated existing variables');

  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

// Check if axios is installed
try {
  require.resolve('axios');
  testPushAPI();
} catch (e) {
  console.log('Installing axios for testing...');
  require('child_process').execSync('npm install axios', { stdio: 'inherit' });
  console.log('Please run this script again.');
} 