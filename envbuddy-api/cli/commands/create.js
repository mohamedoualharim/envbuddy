const inquirer = require('inquirer');
const chalk = require('chalk');
const { setConfig, getConfig } = require('../utils/config');
const api = require('../utils/api');

async function create() {
  try {
    // Check authentication first
    if (!api.isAuthenticated()) {
      console.log(chalk.red('❌ Not authenticated'));
      console.log(chalk.yellow('Please run `envbuddy login` first.'));
      return;
    }

    console.log(chalk.blue('🚀 Create a new project\n'));

    // Prompt for project name
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Enter project name:',
        validate: (input) => {
          if (!input || input.trim().length === 0) {
            return 'Project name cannot be empty';
          }
          if (input.trim().length < 3) {
            return 'Project name must be at least 3 characters';
          }
          if (!/^[a-zA-Z0-9-_]+$/.test(input.trim())) {
            return 'Project name can only contain letters, numbers, hyphens, and underscores';
          }
          return true;
        }
      },
      {
        type: 'confirm',
        name: 'setAsDefault',
        message: 'Set this as your default project?',
        default: true
      }
    ]);

    const projectName = answers.projectName.trim();

    console.log(chalk.blue('\n📝 Creating project...'));

    // Create the project
    const response = await api.post('/api/projects', {
      name: projectName
    });

    const project = response.data.data;

    console.log(chalk.green(`\n✅ Project created successfully!`));
    console.log(chalk.gray(`Project ID: ${project.id}`));
    console.log(chalk.gray(`Project Name: ${project.name}`));

    // Set as default project if requested
    if (answers.setAsDefault) {
      setConfig('projectId', project.id);
      console.log(chalk.green(`\n✅ Project selected as default: ${project.name}`));
    }

    // Show next steps
    console.log(chalk.blue('\n📋 Next steps:'));
    console.log(chalk.gray('1. Push your environment variables:'));
    console.log(chalk.cyan(`   envbuddy push .env`));
    console.log(chalk.gray('2. Or push to a specific environment:'));
    console.log(chalk.cyan(`   envbuddy push .env.production -e production`));
    
    if (!answers.setAsDefault) {
      console.log(chalk.gray('\n3. To use this project:'));
      console.log(chalk.cyan(`   envbuddy project ${project.id}`));
      console.log(chalk.gray('   Or use -p flag:'));
      console.log(chalk.cyan(`   envbuddy push -p ${project.id}`));
    }

  } catch (error) {
    if (error.response) {
      if (error.response.status === 409) {
        console.log(chalk.red('\n❌ Project already exists'));
        console.log(chalk.yellow('A project with this name already exists.'));
        console.log(chalk.yellow('Please choose a different name.'));
      } else if (error.response.status !== 401) {
        console.log(chalk.red(`\n❌ Failed to create project: ${error.response.data.error || error.response.statusText}`));
        if (error.response.data.details) {
          console.log(chalk.gray(`Details: ${error.response.data.details}`));
        }
      }
    } else {
      console.log(chalk.red(`\n❌ Error: ${error.message}`));
    }
  }
}

module.exports = create; 