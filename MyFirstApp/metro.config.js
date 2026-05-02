const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configure Metro to handle platform-specific requires better
config.resolver = {
  ...config.resolver,
  sourceExts: ['ts', 'tsx', 'mjs', 'js', 'json', 'web.ts', 'web.tsx', 'web.js'],
};

module.exports = config;


