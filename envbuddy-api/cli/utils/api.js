const axios = require('axios');
const chalk = require('chalk');
const { getConfig } = require('./config');

// Create an axios instance with auth headers
function createAuthenticatedClient() {
  const config = getConfig();
  
  if (!config.apiUrl) {
    throw new Error('API URL not configured. Run `envbuddy init` first.');
  }
  
  if (!config.token) {
    throw new Error('Not authenticated. Run `envbuddy login` first.');
  }
  
  const client = axios.create({
    baseURL: config.apiUrl,
    headers: {
      'Authorization': `Bearer ${config.token}`
    }
  });
  
  // Add response interceptor to handle auth errors
  client.interceptors.response.use(
    response => response,
    error => {
      if (error.response && error.response.status === 401) {
        console.log(chalk.red('\n❌ Authentication failed'));
        console.log(chalk.yellow('Your token may have expired or is invalid.'));
        console.log(chalk.yellow('Please run `envbuddy login` to authenticate again.\n'));
      }
      return Promise.reject(error);
    }
  );
  
  return client;
}

// Wrapper for authenticated requests
async function authenticatedRequest(method, url, data = null, options = {}) {
  try {
    const client = createAuthenticatedClient();
    
    const requestConfig = {
      method,
      url,
      ...options
    };
    
    if (data) {
      if (method === 'get') {
        requestConfig.params = data;
      } else {
        requestConfig.data = data;
      }
    }
    
    return await client(requestConfig);
  } catch (error) {
    if (error.message.includes('Not authenticated')) {
      console.log(chalk.red('❌ Not authenticated'));
      console.log(chalk.yellow('Please run `envbuddy login` first.'));
      process.exit(1);
    }
    throw error;
  }
}

// Convenience methods
const api = {
  get: (url, params, options) => authenticatedRequest('get', url, params, options),
  post: (url, data, options) => authenticatedRequest('post', url, data, options),
  put: (url, data, options) => authenticatedRequest('put', url, data, options),
  delete: (url, data, options) => authenticatedRequest('delete', url, data, options),
  
  // Check if user is logged in
  isAuthenticated: () => {
    const config = getConfig();
    return !!config.token;
  },
  
  // Get auth headers for manual use (e.g., with FormData)
  getAuthHeaders: () => {
    const config = getConfig();
    if (!config.token) {
      throw new Error('Not authenticated. Run `envbuddy login` first.');
    }
    return {
      'Authorization': `Bearer ${config.token}`
    };
  }
};

module.exports = api; 