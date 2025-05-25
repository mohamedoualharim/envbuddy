const inquirer = require('inquirer');
const chalk = require('chalk');
const { setConfig, getConfig } = require('../utils/config');
const axios = require('axios');

async function login() {
  console.log(chalk.blue('🔐 EnvBuddy Login\n'));
  
  const config = getConfig();
  
  // Check if already logged in
  if (config.token) {
    const answer = await inquirer.prompt([{
      type: 'confirm',
      name: 'relogin',
      message: 'You are already logged in. Do you want to log in with a different token?',
      default: false
    }]);
    
    if (!answer.relogin) {
      console.log(chalk.gray('Login cancelled'));
      return;
    }
  }
  
  console.log('To get your JWT token:');
  console.log(chalk.gray('1. Go to your Supabase Dashboard'));
  console.log(chalk.gray('2. Sign in to your application'));
  console.log(chalk.gray('3. Get the access token from the session\n'));
  
  const answers = await inquirer.prompt([
    {
      type: 'password',
      name: 'token',
      message: 'Enter your Supabase JWT token:',
      mask: '*',
      validate: (input) => {
        if (!input || input.trim().length === 0) {
          return 'Token cannot be empty';
        }
        // Basic JWT format validation (header.payload.signature)
        const parts = input.trim().split('.');
        if (parts.length !== 3) {
          return 'Invalid token format. JWT should have 3 parts separated by dots';
        }
        return true;
      }
    }
  ]);
  
  const token = answers.token.trim();
  
  // Verify the token by making a test request
  console.log(chalk.blue('\n🔍 Verifying token...'));
  
  try {
    // Extract project ref from API URL to verify token
    const apiUrl = config.apiUrl || 'http://localhost:3000';
    
    // Try to get projects (any authenticated endpoint)
    const response = await axios.get(`${apiUrl}/api/projects`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Token is valid, save it
    setConfig('token', token);
    
    console.log(chalk.green('\n✅ Login successful!'));
    console.log(chalk.gray('Your token has been saved securely.'));
    console.log(chalk.gray(`Config location: ~/.envbuddy/config.json\n`));
    
    // Show user info if available
    if (response.headers['x-user-id']) {
      console.log(chalk.gray(`User ID: ${response.headers['x-user-id']}`));
    }
    
    console.log('\nYou can now use all EnvBuddy commands:');
    console.log(chalk.cyan('  envbuddy push') + ' - Push environment variables');
    console.log(chalk.cyan('  envbuddy pull-vars') + ' - Pull environment variables');
    console.log(chalk.cyan('  envbuddy list') + ' - List your projects');
    
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) {
        console.log(chalk.red('\n❌ Invalid token'));
        console.log(chalk.yellow('The token you provided is invalid or expired.'));
        console.log(chalk.yellow('Please check your token and try again.'));
      } else if (error.response.status === 500 && error.response.data.message.includes('Authentication service not configured')) {
        console.log(chalk.red('\n❌ API authentication not configured'));
        console.log(chalk.yellow('The API server is not properly configured for authentication.'));
        console.log(chalk.yellow('Please ensure SUPABASE_URL is set on the server.'));
      } else {
        console.log(chalk.red(`\n❌ Verification failed: ${error.response.data.error || error.response.statusText}`));
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.log(chalk.red('\n❌ Cannot connect to API'));
      console.log(chalk.yellow(`Make sure the API is running at ${config.apiUrl}`));
      console.log(chalk.yellow('Run `envbuddy init` to update the API URL if needed.'));
    } else {
      console.log(chalk.red(`\n❌ Error: ${error.message}`));
    }
    
    console.log(chalk.gray('\nToken was not saved.'));
  }
}

module.exports = login; 