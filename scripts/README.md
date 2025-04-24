# Codebase Fix Scripts

This directory contains scripts to automatically fix common issues in the codebase.

## Available Scripts

1. `fix-tailwind.js`: Fixes common Tailwind CSS class issues
   - Replaces size-related classes with proper Tailwind classes
   - Changes deprecated class names to their modern equivalents
   - Converts arbitrary values to Tailwind equivalents

2. `fix-react.js`: Fixes React-related issues
   - Removes duplicate imports
   - Removes unused variables
   - Fixes empty href attributes
   - Optimizes React component structure

3. `fix-typescript.js`: Fixes TypeScript-related issues
   - Replaces `any` types with `unknown`
   - Removes unnecessary non-null assertions
   - Removes empty interfaces
   - Cleans up unused type parameters

## Usage

You can run these scripts individually or all at once using npm scripts:

```bash
# Run all fixes
npm run fix

# Run individual fixes
npm run fix:tailwind
npm run fix:react
npm run fix:typescript
```

## Important Notes

- Always commit your changes before running these scripts
- Review the changes after running the scripts
- The scripts will only modify files in your project directory, excluding:
  - node_modules
  - dist
  - .next
  - scripts directory itself

## Requirements

The scripts require the following dependencies (automatically installed via package.json):
- @babel/parser
- @babel/traverse
- @babel/generator
- glob
- typescript 