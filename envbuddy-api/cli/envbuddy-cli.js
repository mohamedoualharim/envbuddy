#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const { push, pull, pullVars, list, init, setProject, create } = require('./commands');
const login = require('./commands/login');
const logout = require('./commands/logout');

const program = new Command();

// Load config
const configPath = path.join(process.env.HOME || process.env.USERPROFILE, '.envbuddy', 'config.json');

program
  .name('envbuddy')
  .description('CLI tool for managing environment files with EnvBuddy API')
  .version('1.0.0');

// Init command - Set up API configuration
program
  .command('init')
  .description('Initialize EnvBuddy CLI with API configuration')
  .action(init);

// Login command - Authenticate with JWT token
program
  .command('login')
  .description('Authenticate with your Supabase JWT token')
  .action(login);

// Logout command - Remove saved token
program
  .command('logout')
  .description('Log out and remove saved authentication')
  .action(logout);

// Create command - Create a new project
program
  .command('create')
  .description('Create a new project')
  .action(create);

// Set project command
program
  .command('project <projectId>')
  .description('Set the active project ID')
  .action(setProject);

// Push command - Upload .env file
program
  .command('push [file]')
  .description('Push environment variables to the server')
  .option('-p, --project <projectId>', 'Project ID (overrides default)')
  .option('-e, --environment <env>', 'Environment name', 'development')
  .option('-d, --description <desc>', 'Description of the env file')
  .action(push);

// Pull command - Download .env file
program
  .command('pull')
  .description('Pull an environment file from the server (legacy)')
  .option('-p, --project <projectId>', 'Project ID (overrides default)')
  .option('-e, --environment <env>', 'Environment name')
  .option('-o, --output <file>', 'Output file name', '.env')
  .option('--id <fileId>', 'Specific file ID to pull')
  .action(pull);

// Pull-vars command - Download variables from env_vars table
program
  .command('pull-vars')
  .description('Pull environment variables from the server')
  .option('-p, --project <projectId>', 'Project ID (overrides default)')
  .option('-e, --environment <env>', 'Environment name', 'development')
  .option('-o, --output <file>', 'Output file name', '.env')
  .option('-f, --force', 'Overwrite existing file without prompt')
  .action(pullVars);

// List command - List available env files
program
  .command('list')
  .alias('ls')
  .description('List your projects or environment files')
  .option('-p, --project <projectId>', 'Project ID (overrides default)')
  .option('-e, --environment <env>', 'Filter by environment')
  .action(list);

// Parse arguments
program.parse(process.argv);

// Show help if no command is provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
} 