const { execSync } = require('child_process');
const path = require('path');

console.log('Starting to fix all issues...\n');

const scripts = [
  'fix-tailwind.js',
  'fix-react.js',
  'fix-typescript.js'
];

scripts.forEach(script => {
  console.log(`Running ${script}...`);
  try {
    execSync(`node ${path.join(__dirname, script)}`, { stdio: 'inherit' });
    console.log(`✅ ${script} completed successfully\n`);
  } catch (error) {
    console.error(`❌ Error running ${script}:`, error.message);
    process.exit(1);
  }
});

console.log('🎉 All fixes completed successfully!'); 