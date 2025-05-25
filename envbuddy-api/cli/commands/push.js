const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { getConfig, setConfig } = require('../utils/config');
const api = require('../utils/api');

// Parse .env file content into key-value pairs
function parseEnvFile(content) {
  const variables = {};
  const lines = content.split('\n');
  
  lines.forEach(line => {
    // Skip empty lines and comments
    if (!line.trim() || line.trim().startsWith('#')) return;
    
    const [key, ...valueParts] = line.split('=');
    if (key) {
      variables[key.trim()] = valueParts.join('=').trim();
    }
  });
  
  return variables;
}

async function selectProject() {
  console.log(chalk.blue('📋 Fetching your projects...\n'));
  
  try {
    const response = await api.get('/api/projects');
    const projects = response.data.data;
    
    if (!projects || projects.length === 0) {
      console.log(chalk.yellow('⚠️  No projects found'));
      console.log(chalk.gray('Create a project first:'));
      console.log(chalk.cyan('  envbuddy create'));
      return null;
    }
    
    const choices = projects.map(project => ({
      name: `${project.name} (${project.id})`,
      value: project.id,
      short: project.name
    }));
    
    const answer = await inquirer.prompt([{
      type: 'list',
      name: 'projectId',
      message: 'Select a project:',
      choices
    }]);
    
    // Ask if they want to save as default
    const saveDefault = await inquirer.prompt([{
      type: 'confirm',
      name: 'save',
      message: 'Save as default project?',
      default: true
    }]);
    
    if (saveDefault.save) {
      setConfig('projectId', answer.projectId);
      console.log(chalk.green(`✅ Default project set: ${projects.find(p => p.id === answer.projectId).name}\n`));
    }
    
    return answer.projectId;
    
  } catch (error) {
    console.error(chalk.red('Failed to fetch projects:'), error.message);
    return null;
  }
}

async function push(file, options) {
  try {
    const config = getConfig();
    
    // Check authentication first
    if (!api.isAuthenticated()) {
      console.log(chalk.red('❌ Not authenticated'));
      console.log(chalk.yellow('Please run `envbuddy login` first.'));
      return;
    }

    // Determine project ID
    let projectId = options.project || config.projectId;
    
    // If no project ID, prompt for selection
    if (!projectId) {
      console.log(chalk.yellow('⚠️  No default project set\n'));
      projectId = await selectProject();
      
      if (!projectId) {
        return; // User cancelled or no projects available
      }
    }

    // Determine file to upload
    let filePath = file || '.env';
    
    // If no file specified and .env doesn't exist, ask user
    if (!file && !fs.existsSync(filePath)) {
      const envFiles = fs.readdirSync('.').filter(f => f.endsWith('.env'));
      
      if (envFiles.length === 0) {
        console.log(chalk.red('❌ No .env files found in current directory'));
        return;
      }

      const answer = await inquirer.prompt([{
        type: 'list',
        name: 'file',
        message: 'Select file to upload:',
        choices: envFiles
      }]);
      
      filePath = answer.file;
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(chalk.red(`❌ File not found: ${filePath}`));
      return;
    }

    console.log(chalk.blue(`📤 Pushing ${chalk.bold(filePath)} to project ${chalk.bold(projectId)}...`));

    // Read and parse the .env file
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const variables = parseEnvFile(fileContent);
    
    // Check if any variables were found
    const varCount = Object.keys(variables).length;
    if (varCount === 0) {
      console.log(chalk.yellow('⚠️  No environment variables found in file'));
      return;
    }

    console.log(chalk.gray(`Found ${varCount} variable(s)`));

    // Prepare request data
    const requestData = {
      projectId,
      environment: options.environment || 'development',
      variables
    };

    // Send push request using authenticated API
    const response = await api.post('/api/env/push', requestData);

    // Display success message
    console.log(chalk.green('✅ Environment variables pushed successfully!'));
    console.log(chalk.gray(`Environment: ${response.data.data.environment}`));
    console.log(chalk.gray(`Total variables: ${response.data.data.total_variables}`));
    
    if (response.data.data.inserted > 0) {
      console.log(chalk.gray(`New variables: ${response.data.data.inserted}`));
    }
    
    if (response.data.data.updated > 0) {
      console.log(chalk.gray(`Updated variables: ${response.data.data.updated}`));
    }
    
    if (response.data.data.batch_id) {
      console.log(chalk.gray(`Batch ID: ${response.data.data.batch_id}`));
    }

    // Show warnings if any
    if (response.data.warnings && response.data.warnings.length > 0) {
      console.log(chalk.yellow('\n⚠️  Warnings:'));
      response.data.warnings.forEach(warning => {
        console.log(chalk.yellow(`   - ${warning}`));
      });
    }

    // Add description if provided
    if (options.description) {
      console.log(chalk.gray(`\nDescription: ${options.description}`));
    }

  } catch (error) {
    if (error.response) {
      // Auth errors are already handled by the API utility
      if (error.response.status !== 401) {
        console.log(chalk.red(`❌ API Error: ${error.response.data.error || error.response.statusText}`));
        if (error.response.data.details) {
          console.log(chalk.gray(`Details: ${error.response.data.details}`));
        }
        if (error.response.data.message) {
          console.log(chalk.gray(`Message: ${error.response.data.message}`));
        }
      }
    } else {
      console.log(chalk.red(`❌ Error: ${error.message}`));
    }
  }
}

module.exports = push; 