const path = require('path');

module.exports = {
  root: true,
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:jsx-a11y/recommended',
    'plugin:tailwindcss/recommended',
    'prettier'
  ],
  plugins: [
    '@typescript-eslint',
    'import',
    'jsx-a11y',
    'unused-imports',
    'tailwindcss'
  ],
  settings: {
    tailwindcss: {
      callees: ['cn', 'clsx', 'twMerge'],
      config: path.resolve(__dirname, './tailwind.config.js'),
      classRegex: '^(class(Name)?|tw)$',
      whitelist: [
        // Add your custom Tailwind classes here
        'data-\\[.*\\].*',
        'fade-in-.*',
        'zoom-in-.*',
        'slide-in-from-.*',
        'slide-out-to-.*',
        'from-gold-\\d+',
        'to-gold-\\d+',
        'transform-style-3d',
        'backface-hidden',
        'selection-popup'
      ]
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json'
      },
      node: true
    },
    react: {
      version: 'detect'
    }
  },
  rules: {
    // React rules
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/no-unknown-property': ['error', { ignore: ['jsx', 'global'] }],

    // TypeScript rules
    '@typescript-eslint/no-unused-vars': ['warn', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_'
    }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/consistent-type-imports': ['error', {
      prefer: 'type-imports',
      fixStyle: 'separate-type-imports'
    }],

    // Import rules
    'import/order': [
      'error',
      {
        'groups': [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'object',
          'type'
        ],
        'pathGroups': [
          {
            'pattern': 'react',
            'group': 'builtin',
            'position': 'before'
          },
          {
            'pattern': 'next/**',
            'group': 'builtin',
            'position': 'before'
          },
          {
            'pattern': '@/**',
            'group': 'internal',
            'position': 'after'
          }
        ],
        'pathGroupsExcludedImportTypes': ['react', 'next'],
        'newlines-between': 'always',
        'alphabetize': {
          'order': 'asc',
          'caseInsensitive': true
        }
      }
    ],
    'import/no-duplicates': 'error',
    'unused-imports/no-unused-imports': 'error',

    // Tailwind rules
    'tailwindcss/classnames-order': 'warn',
    'tailwindcss/no-custom-classname': ['warn', {
      whitelist: [
        'data-\\[.*\\].*',
        'fade-in-.*',
        'zoom-in-.*',
        'slide-in-from-.*',
        'slide-out-to-.*',
        'from-gold-\\d+',
        'to-gold-\\d+',
        'transform-style-3d',
        'backface-hidden',
        'selection-popup'
      ]
    }],
    'tailwindcss/enforces-shorthand': 'warn',

    // Accessibility rules
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/no-static-element-interactions': 'warn',
    'jsx-a11y/anchor-is-valid': 'warn',
    'jsx-a11y/label-has-associated-control': 'warn'
  },
  ignorePatterns: [
    'node_modules/',
    '.next/',
    'out/',
    'public/',
    '**/*.d.ts',
    '*.config.js',
    '*.config.ts'
  ]
}