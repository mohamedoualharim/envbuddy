const inquirer = require('inquirer');
const chalk = require('chalk');
const { saveConfig, CONFIG_FILE } = require('../utils/config');

async function init() {
  console.log(chalk.blue('🚀 Welcome to EnvBuddy CLI!\n'));
  console.log('Let\'s set up your configuration.\n');

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'apiUrl',
      message: 'Enter your EnvBuddy API URL:',
      default: 'http://localhost:3000',
      validate: (input) => {
        try {
          new URL(input);
          return true;
        } catch {
          return 'Please enter a valid URL';
        }
      }
    },
    {
      type: 'input',
      name: 'projectId',
      message: 'Enter your default project ID (can be changed later):',
      default: ''
    }
  ]);

  const config = {
    apiUrl: answers.apiUrl.replace(/\/$/, ''), // Remove trailing slash
    projectId: answers.projectId || null
  };

  saveConfig(config);

  console.log(chalk.green('\n✅ Configuration saved successfully!'));
  console.log(chalk.gray(`Config file: ${CONFIG_FILE}`));
  console.log('\nYou can now use:');
  console.log(chalk.cyan('  envbuddy push [file]') + ' - to upload env files');
  console.log(chalk.cyan('  envbuddy pull') + ' - to download env files');
  console.log(chalk.cyan('  envbuddy list') + ' - to list available env files');
}

module.exports = init; 