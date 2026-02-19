const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Required for pnpm: Metro needs to follow symlinks in node_modules/.pnpm
config.resolver.unstable_enableSymlinks = true;

// Also add the project root and node_modules to watch folders so Metro
// can resolve modules through pnpm's virtual store
config.watchFolders = [
  path.resolve(__dirname, 'node_modules'),
];

module.exports = config;
