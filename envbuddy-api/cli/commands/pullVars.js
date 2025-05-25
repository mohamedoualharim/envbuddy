const fs = require('fs');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { getConfig, setConfig } = require('../utils/config');
const api = require('../utils/api');

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

async function pullVars(options) {
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

    // Determine environment
    const environment = options.environment || 'development';
    
    console.log(chalk.blue(`📥 Pulling variables for project ${chalk.bold(projectId)} (${environment})...`));

    // Fetch variables from the export endpoint
    try {
      const response = await api.get(`/api/env/export/${projectId}/${environment}`);
      
      const outputFile = options.output || '.env';
      
      // Check if output file already exists
      if (fs.existsSync(outputFile) && !options.force) {
        const answer = await inquirer.prompt([{
          type: 'confirm',
          name: 'overwrite',
          message: `File ${outputFile} already exists. Overwrite?`,
          default: false
        }]);

        if (!answer.overwrite) {
          console.log(chalk.yellow('⚠️  Pull cancelled'));
          return;
        }
      }

      // Save the file
      fs.writeFileSync(outputFile, response.data);
      
      console.log(chalk.green(`✅ Variables pulled successfully to ${chalk.bold(outputFile)}`));

      // Count variables
      const lines = response.data.split('\n');
      const varCount = lines.filter(line => line.trim() && !line.trim().startsWith('#') && line.includes('=')).length;
      console.log(chalk.gray(`Variables: ${varCount} found`));
      console.log(chalk.gray(`Environment: ${environment}`));

    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log(chalk.yellow(`⚠️  No variables found for ${environment} environment`));
        
        // Offer to list available environments
        const answer = await inquirer.prompt([{
          type: 'confirm',
          name: 'listEnvironments',
          message: 'Would you like to see available environments?',
          default: true
        }]);

        if (answer.listEnvironments) {
          const varsResponse = await api.get(`/api/env/vars/${projectId}`);
          if (varsResponse.data.data && Object.keys(varsResponse.data.data).length > 0) {
            console.log(chalk.blue('\nAvailable environments:'));
            Object.keys(varsResponse.data.data).forEach(env => {
              const varCount = Object.keys(varsResponse.data.data[env]).length;
              console.log(chalk.gray(`  - ${env} (${varCount} variables)`));
            });
          } else {
            console.log(chalk.yellow('No environments found for this project'));
          }
        }
      } else {
        throw error;
      }
    }

  } catch (error) {
    if (error.response && error.response.status !== 401) {
      console.log(chalk.red(`❌ API Error: ${error.response.data.error || error.response.statusText}`));
      if (error.response.data.details) {
        console.log(chalk.gray(`Details: ${error.response.data.details}`));
      }
    } else if (!error.response) {
      console.log(chalk.red(`❌ Error: ${error.message}`));
    }
  }
}

module.exports = pullVars; 