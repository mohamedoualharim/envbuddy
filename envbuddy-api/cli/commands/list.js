const chalk = require('chalk');
const { getConfig } = require('../utils/config');
const api = require('../utils/api');

async function list(options) {
  try {
    const config = getConfig();
    
    // Check authentication first
    if (!api.isAuthenticated()) {
      console.log(chalk.red('❌ Not authenticated'));
      console.log(chalk.yellow('Please run `envbuddy login` first.'));
      return;
    }

    // First, get all projects for the user
    console.log(chalk.blue(`📋 Fetching your projects...\n`));
    
    const projectsResponse = await api.get('/api/projects');
    const projects = projectsResponse.data.data;

    if (!projects || projects.length === 0) {
      console.log(chalk.yellow('⚠️  No projects found'));
      console.log(chalk.gray('Create a project first using the API or web interface'));
      return;
    }

    // If a specific project is requested
    const projectId = options.project || config.projectId;
    
    if (projectId) {
      // Find the project
      const project = projects.find(p => p.id === projectId || p.name === projectId);
      if (!project) {
        console.log(chalk.red(`❌ Project not found: ${projectId}`));
        console.log(chalk.gray('Available projects:'));
        projects.forEach(p => {
          console.log(chalk.gray(`  - ${p.name} (${p.id})`));
        });
        return;
      }

      console.log(chalk.blue(`Listing env files for project ${chalk.bold(project.name)}...\n`));

      // Build query URL
      let url = `/api/env/project/${project.id}`;
      const params = {};
      if (options.environment) {
        params.environment = options.environment;
      }

      const response = await api.get(url, params);
      const files = response.data.data;

      if (!files || files.length === 0) {
        console.log(chalk.yellow('⚠️  No env files found'));
        if (options.environment) {
          console.log(chalk.gray(`No files for environment: ${options.environment}`));
        }
        return;
      }

      // Display files in a table format
      console.log(chalk.bold('ID                                   | Environment | File Name      | Description'));
      console.log(chalk.gray('─'.repeat(85)));

      files.forEach(file => {
        const id = file.id.substring(0, 36);
        const env = (file.environment || 'unknown').padEnd(11);
        const fileName = (file.file_name || 'unnamed').padEnd(14);
        const description = file.description || 'No description';
        
        console.log(`${id} | ${env} | ${fileName} | ${description}`);
      });

      console.log(chalk.gray('\n' + '─'.repeat(85)));
      console.log(chalk.gray(`Total: ${files.length} file(s)`));

      // Show variable counts
      const totalVars = files.reduce((sum, file) => {
        return sum + (file.variables ? Object.keys(file.variables).length : 0);
      }, 0);
      console.log(chalk.gray(`Total variables: ${totalVars}`));
      
    } else {
      // List all projects
      console.log(chalk.bold('Your Projects:'));
      console.log(chalk.gray('─'.repeat(60)));
      
      projects.forEach(project => {
        console.log(chalk.cyan(`\n${project.name}`));
        console.log(chalk.gray(`ID: ${project.id}`));
        console.log(chalk.gray(`Created: ${new Date(project.created_at).toLocaleDateString()}`));
      });
      
      console.log(chalk.gray('\n' + '─'.repeat(60)));
      console.log(chalk.gray(`Total: ${projects.length} project(s)`));
      console.log(chalk.gray('\nTip: Use `envbuddy list -p <project-id>` to see env files for a specific project'));
      console.log(chalk.gray('     Use `envbuddy project <project-id>` to set a default project'));
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

module.exports = list; 