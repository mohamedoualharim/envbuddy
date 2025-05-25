const fs = require('fs');
const path = require('path');
const os = require('os');

const CONFIG_DIR = path.join(os.homedir(), '.envbuddy');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

const defaultConfig = {
  apiUrl: 'http://localhost:3000',
  projectId: null
};

function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

function loadConfig() {
  ensureConfigDir();
  
  if (!fs.existsSync(CONFIG_FILE)) {
    saveConfig(defaultConfig);
    return defaultConfig;
  }

  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    return { ...defaultConfig, ...config };
  } catch (error) {
    console.error('Error loading config:', error.message);
    return defaultConfig;
  }
}

function saveConfig(config) {
  ensureConfigDir();
  
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Error saving config:', error.message);
  }
}

function getConfig(key) {
  const config = loadConfig();
  return key ? config[key] : config;
}

function setConfig(key, value) {
  const config = loadConfig();
  config[key] = value;
  saveConfig(config);
  return config;
}

module.exports = {
  loadConfig,
  saveConfig,
  getConfig,
  setConfig,
  CONFIG_FILE
}; 