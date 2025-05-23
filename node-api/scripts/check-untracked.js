#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

try {
  // Get untracked files using git command
  const untrackedFiles = execSync('git ls-files --others --exclude-standard', { encoding: 'utf8' })
    .split('\n')
    .filter(file => file) // Remove empty lines
    .filter(file => !file.startsWith('src/plugins/')); // Exclude files in plugins directory

  if (untrackedFiles.length === 0) {
    console.log('No untracked files found (excluding plugins/* directory)');
  } else {
    console.log('Untracked files (excluding plugins/* directory):');
    untrackedFiles.forEach(file => console.log(`- ${file}`));
  }

  process.exit(0);
} catch (error) {
  console.error('Error checking untracked files:', error.message);
  process.exit(1);
}