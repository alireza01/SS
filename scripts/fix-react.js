const fs = require('fs');
const path = require('path');
const glob = require('glob');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;

// Helper function to fix React issues
function fixReactIssues(content) {
  try {
    const ast = parser.parse(content, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx']
    });

    // Track imports to remove duplicates
    const imports = new Map();
    const unusedVars = new Set();

    traverse(ast, {
      ImportDeclaration(path) {
        const source = path.node.source.value;
        if (!imports.has(source)) {
          imports.set(source, new Set());
        }
        
        path.node.specifiers.forEach(specifier => {
          const importedName = specifier.local.name;
          if (imports.get(source).has(importedName)) {
            path.remove();
          } else {
            imports.get(source).add(importedName);
          }
        });
      },
      
      VariableDeclarator(path) {
        const binding = path.scope.getBinding(path.node.id.name);
        if (binding && binding.references === 0) {
          unusedVars.add(path.node.id.name);
        }
      },
      
      JSXAttribute(path) {
        // Fix empty href attributes
        if (path.node.name.name === 'href' && (!path.node.value || path.node.value.value === '')) {
          path.node.value = parser.parseExpression('"#"');
        }
      }
    });

    // Remove unused variables
    traverse(ast, {
      VariableDeclaration(path) {
        path.node.declarations = path.node.declarations.filter(
          decl => !unusedVars.has(decl.id.name)
        );
        if (path.node.declarations.length === 0) {
          path.remove();
        }
      }
    });

    return generate(ast).code;
  } catch (error) {
    console.error(`Error processing file: ${error.message}`);
    return content;
  }
}

// Find all TypeScript and TSX files
const files = glob.sync('**/*.{ts,tsx}', {
  ignore: ['node_modules/**', 'dist/**', '.next/**', 'scripts/**']
});

// Process each file
files.forEach(file => {
  const filePath = path.resolve(file);
  const content = fs.readFileSync(filePath, 'utf8');
  const updatedContent = fixReactIssues(content);
  
  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent);
    console.log(`Updated ${file}`);
  }
});

console.log('React fixes completed!'); 