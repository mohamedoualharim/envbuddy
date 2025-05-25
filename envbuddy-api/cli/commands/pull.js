const fs = require('fs');
const axios = require('axios');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { getConfig } = require('../utils/config');

async function pull(options) {
  try {
    const config = getConfig();
    
    if (!config.apiUrl) {
      console.log(chalk.red('❌ API URL not configured. Run `envbuddy init` first.'));
      return;
    }

    // Determine project ID
    const projectId = options.project || config.projectId;
    if (!projectId) {
      console.log(chalk.red('❌ No project ID specified. Use -p option or set default with `envbuddy project <id>`'));
      return;
    }

    let fileId = options.id;
    
    // If no file ID specified, list available files and let user choose
    if (!fileId) {
      console.log(chalk.blue(`📋 Fetching env files for project ${chalk.bold(projectId)}...`));
      
      // Build query URL
      let queryUrl = `${config.apiUrl}/api/env/project/${projectId}`;
      if (options.environment) {
        queryUrl += `?environment=${options.environment}`;
      }

      const listResponse = await axios.get(queryUrl);
      const files = listResponse.data.data;

      if (!files || files.length === 0) {
        console.log(chalk.yellow('⚠️  No env files found for this project'));
        return;
      }

      // Let user select a file
      const choices = files.map(file => ({
        name: `${file.file_name} (${file.environment}) - ${file.description || 'No description'}`,
        value: file.id,
        short: file.file_name
      }));

      const answer = await inquirer.prompt([{
        type: 'list',
        name: 'fileId',
        message: 'Select file to download:',
        choices
      }]);

      fileId = answer.fileId;
    }

    console.log(chalk.blue(`📥 Downloading env file...`));

    // Download the file
    const downloadResponse = await axios.get(`${config.apiUrl}/api/env/${fileId}/download`);
    
    // Check if output file already exists
    if (fs.existsSync(options.output) && !options.force) {
      const answer = await inquirer.prompt([{
        type: 'confirm',
        name: 'overwrite',
        message: `File ${options.output} already exists. Overwrite?`,
        default: false
      }]);

      if (!answer.overwrite) {
        console.log(chalk.yellow('⚠️  Download cancelled'));
        return;
      }
    }

    // Save the file
    fs.writeFileSync(options.output, downloadResponse.data);
    
    console.log(chalk.green(`✅ File downloaded successfully to ${chalk.bold(options.output)}`));

    // Show a preview of variables
    const lines = downloadResponse.data.split('\n');
    const varCount = lines.filter(line => line.trim() && !line.trim().startsWith('#') && line.includes('=')).length;
    console.log(chalk.gray(`Variables: ${varCount} found`));

  } catch (error) {
    if (error.response) {
      console.log(chalk.red(`❌ API Error: ${error.response.data.error || error.response.statusText}`));
      if (error.response.data.details) {
        console.log(chalk.gray(`Details: ${error.response.data.details}`));
      }
    } else {
      console.log(chalk.red(`❌ Error: ${error.message}`));
    }
  }
}

module.exports = pull; 