const chalk = require('chalk');
const { setConfig } = require('../utils/config');

function setProject(projectId) {
  setConfig('projectId', projectId);
  console.log(chalk.green(`✅ Active project set to: ${chalk.bold(projectId)}`));
}

module.exports = setProject; 