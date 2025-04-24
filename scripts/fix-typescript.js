const fs = require('fs');
const path = require('path');
const glob = require('glob');
const ts = require('typescript');

// Helper function to fix TypeScript issues
function fixTypeScriptIssues(content) {
  const sourceFile = ts.createSourceFile(
    'temp.ts',
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );

  function visit(node) {
    // Fix any type annotations
    if (ts.isTypeReferenceNode(node) && node.typeName.getText() === 'any') {
      return `unknown`;
    }

    // Fix non-null assertions
    if (ts.isNonNullExpression(node)) {
      return node.expression.getText();
    }

    // Fix empty interfaces
    if (ts.isInterfaceDeclaration(node) && node.members.length === 0) {
      return '';
    }

    // Fix unused type parameters
    if (ts.isTypeParameterDeclaration(node) && !node.constraint && !node.default) {
      const references = findReferences(node.name.text, sourceFile);
      if (references.length <= 1) {
        return '';
      }
    }

    return ts.forEachChild(node, visit);
  }

  function findReferences(name, node) {
    const references = [];
    function findRef(node) {
      if (ts.isIdentifier(node) && node.text === name) {
        references.push(node);
      }
      ts.forEachChild(node, findRef);
    }
    findRef(node);
    return references;
  }

  visit(sourceFile);

  // Apply transformations
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const result = printer.printFile(sourceFile);

  return result;
}

// Find all TypeScript files
const files = glob.sync('**/*.{ts,tsx}', {
  ignore: ['node_modules/**', 'dist/**', '.next/**', 'scripts/**']
});

// Process each file
files.forEach(file => {
  const filePath = path.resolve(file);
  const content = fs.readFileSync(filePath, 'utf8');
  const updatedContent = fixTypeScriptIssues(content);
  
  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent);
    console.log(`Updated ${file}`);
  }
});

console.log('TypeScript fixes completed!'); 