const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

// Create a sample .env file for testing
const sampleEnvContent = `# Database Configuration
DATABASE_URL=postgres://user:password@localhost:5432/mydb
DATABASE_NAME=mydb

# API Keys
API_KEY=your-api-key-here
SECRET_KEY=your-secret-key-here

# Application Settings
NODE_ENV=development
PORT=3000
DEBUG=true
`;

async function testAPI() {
  try {
    console.log('🧪 Testing EnvBuddy API...\n');

    // 1. Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data);
    console.log('');

    // 2. Create a test .env file
    fs.writeFileSync('test.env', sampleEnvContent);
    console.log('2. Created test.env file');

    // 3. Upload the env file
    console.log('3. Uploading env file...');
    const form = new FormData();
    form.append('envFile', fs.createReadStream('test.env'));
    form.append('projectId', 'test-project');
    form.append('environment', 'development');
    form.append('description', 'Test environment variables');

    const uploadResponse = await axios.post(`${API_BASE_URL}/api/env/upload`, form, {
      headers: form.getHeaders()
    });
    console.log('✅ Upload response:', uploadResponse.data);
    const uploadedFileId = uploadResponse.data.data.id;
    console.log('');

    // 4. Get all env files for the project
    console.log('4. Getting all env files for project...');
    const projectFilesResponse = await axios.get(`${API_BASE_URL}/api/env/project/test-project`);
    console.log('✅ Project files:', projectFilesResponse.data);
    console.log('');

    // 5. Get specific env file
    console.log('5. Getting specific env file...');
    const getFileResponse = await axios.get(`${API_BASE_URL}/api/env/${uploadedFileId}`);
    console.log('✅ File details:', {
      id: getFileResponse.data.data.id,
      project_id: getFileResponse.data.data.project_id,
      environment: getFileResponse.data.data.environment,
      variables: getFileResponse.data.data.variables
    });
    console.log('');

    // 6. Update the env file
    console.log('6. Updating env file...');
    const updateForm = new FormData();
    updateForm.append('environment', 'staging');
    updateForm.append('description', 'Updated test environment');

    const updateResponse = await axios.put(`${API_BASE_URL}/api/env/${uploadedFileId}`, updateForm, {
      headers: updateForm.getHeaders()
    });
    console.log('✅ Update response:', updateResponse.data);
    console.log('');

    // 7. Download env file
    console.log('7. Downloading env file...');
    const downloadResponse = await axios.get(`${API_BASE_URL}/api/env/${uploadedFileId}/download`);
    console.log('✅ Downloaded content preview:', downloadResponse.data.substring(0, 100) + '...');
    console.log('');

    // 8. Delete the test file
    console.log('8. Deleting test env file...');
    const deleteResponse = await axios.delete(`${API_BASE_URL}/api/env/${uploadedFileId}`);
    console.log('✅ Delete response:', deleteResponse.data);

    // Clean up
    fs.unlinkSync('test.env');
    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Check if axios is installed
try {
  require.resolve('axios');
  testAPI();
} catch (e) {
  console.log('Installing axios for testing...');
  require('child_process').execSync('npm install axios', { stdio: 'inherit' });
  console.log('Please run this script again.');
} 