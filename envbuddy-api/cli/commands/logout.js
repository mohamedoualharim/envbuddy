const chalk = require('chalk');
const inquirer = require('inquirer');
const { setConfig, getConfig } = require('../utils/config');

async function logout() {
  const config = getConfig();
  
  if (!config.token) {
    console.log(chalk.yellow('⚠️  You are not logged in'));
    return;
  }
  
  const answer = await inquirer.prompt([{
    type: 'confirm',
    name: 'confirm',
    message: 'Are you sure you want to log out?',
    default: true
  }]);
  
  if (!answer.confirm) {
    console.log(chalk.gray('Logout cancelled'));
    return;
  }
  
  // Remove the token
  setConfig('token', null);
  
  console.log(chalk.green('✅ Logged out successfully'));
  console.log(chalk.gray('Your authentication token has been removed.'));
  console.log(chalk.gray('\nUse `envbuddy login` to log in again.'));
}

module.exports = logout; 