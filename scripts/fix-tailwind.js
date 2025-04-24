const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Helper function to replace class names
function replaceClassNames(content) {
  // Replace size-related classes
  content = content.replace(/(?:w-(\d+),\s*h-\1|h-(\d+),\s*w-\2)/g, (_, size1, size2) => `size-${size1 || size2}`);
  
  // Replace flex-shrink-0 with shrink-0
  content = content.replace(/flex-shrink-0/g, 'shrink-0');
  
  // Replace arbitrary values with Tailwind equivalents
  const arbitraryReplacements = {
    'left-[50%]': 'left-1/2',
    'top-[50%]': 'top-1/2',
    'translate-x-[-50%]': '-translate-x-1/2',
    'translate-y-[-50%]': '-translate-y-1/2'
  };
  
  Object.entries(arbitraryReplacements).forEach(([arbitrary, tailwind]) => {
    content = content.replace(new RegExp(arbitrary, 'g'), tailwind);
  });
  
  return content;
}

// Find all TypeScript and TSX files
const files = glob.sync('**/*.{ts,tsx}', {
  ignore: ['node_modules/**', 'dist/**', '.next/**', 'scripts/**']
});

// Process each file
files.forEach(file => {
  const filePath = path.resolve(file);
  const content = fs.readFileSync(filePath, 'utf8');
  const updatedContent = replaceClassNames(content);
  
  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent);
    console.log(`Updated ${file}`);
  }
});

console.log('Tailwind class fixes completed!'); 