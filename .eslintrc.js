module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:tailwindcss/recommended",
    "plugin:@next/next/recommended",
    "prettier", // Make sure this is last to override other configs
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
    warnOnUnsupportedTypeScriptVersion: false,
  },
  plugins: [
    "@typescript-eslint",
    "react",
    "jsx-a11y",
    "tailwindcss",
    "import",
    "unused-imports",
  ],
  rules: {
    // React rules
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react/jsx-props-no-spreading": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": [
      "warn",
      {
        additionalHooks: "(useRecoilCallback|useRecoilTransaction_UNSTABLE)",
      },
    ],
    "react/no-unescaped-entities": [
      "error",
      {
        forbid: [
          {
            char: ">",
            alternatives: ["&gt;"],
          },
          {
            char: "}",
            alternatives: ["&#125;"],
          },
        ],
      },
    ],

    // TypeScript rules
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "@typescript-eslint/no-namespace": ["error", { allowDeclarations: true }],
    "@typescript-eslint/ban-ts-comment": [
      "warn",
      {
        "ts-ignore": "allow-with-description",
        minimumDescriptionLength: 10,
      },
    ],
    "@typescript-eslint/consistent-type-imports": [
      "error",
      {
        prefer: "type-imports",
        disallowTypeAnnotations: false,
      },
    ],

    // Import rules
    "import/prefer-default-export": "off",
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          ["parent", "sibling"],
          "index",
          "object",
          "type",
        ],
        pathGroups: [
          {
            pattern: "react",
            group: "builtin",
            position: "before",
          },
          {
            pattern: "next/**",
            group: "builtin",
            position: "before",
          },
          {
            pattern: "@/**",
            group: "internal",
            position: "after",
          },
        ],
        pathGroupsExcludedImportTypes: ["react", "next"],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      },
    ],
    "unused-imports/no-unused-imports": "error",

    // General rules
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-debugger": "warn",
    "no-alert": "error",
    "prefer-const": "error",
    "no-duplicate-imports": "error",
    "no-unused-private-class-members": "error",
    "no-promise-executor-return": "error",
    "no-unsafe-optional-chaining": "error",
    "no-useless-catch": "error",
    "no-useless-return": "error",
    "require-atomic-updates": "error",

    // Next.js rules
    "@next/next/no-html-link-for-pages": "error",
    "@next/next/no-img-element": "error",

    // JSX accessibility rules
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/aria-props": "error",
    "jsx-a11y/aria-proptypes": "error",
    "jsx-a11y/aria-unsupported-elements": "error",
    "jsx-a11y/role-has-required-aria-props": "error",
    "jsx-a11y/role-supports-aria-props": "error",
    "jsx-a11y/click-events-have-key-events": "warn",
    "jsx-a11y/no-static-element-interactions": "warn",
    "jsx-a11y/anchor-has-content": [
      "error",
      {
        components: ["Link"],
      },
    ],

    // Tailwind rules
    "tailwindcss/classnames-order": "warn",
    "tailwindcss/enforces-negative-arbitrary-values": "warn",
    "tailwindcss/enforces-shorthand": "warn",
    "tailwindcss/migration-from-tailwind-2": "warn",
    "tailwindcss/no-custom-classname": [
      "warn",
      {
        whitelist: [
          "toaster",
          "animate-caret-blink",
          "animate-in",
          "animate-out",
          "fade-in-0",
          "fade-out-0",
          "zoom-in-95",
          "zoom-out-95",
          "slide-in-from-top-2",
          "slide-in-from-right-2",
          "slide-in-from-bottom-2",
          "slide-in-from-left-2",
          "perspective-1000",
          "origin-top-center",
          "data-\\[.*\\].*",
          "bg-.*",
          "text-.*",
          "border-.*",
          "ring-.*",
          "focus-visible:ring-.*",
          "focus:.*",
          "hover:.*",
          "active:.*",
          "group-.*",
          "peer-.*",
          "has-\\[.*\\].*",
        ],
      },
    ],
  },
  settings: {
    react: {
      version: 'detect',
      runtime: 'automatic'
    },
    'import/resolver': {
      typescript: {},
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
    tailwindcss: {
      config: 'tailwind.config.js',
      callees: ['cn', 'clsx', 'twMerge'],
      classRegex: '^(class(Name)?|tw)$',
      whitelist: [
        'bg-background',
        'text-foreground',
        'bg-muted',
        'text-muted-foreground',
        'bg-popover',
        'text-popover-foreground',
        'bg-border',
        'border-input',
        'ring-offset-background',
        'bg-primary',
        'text-primary',
        'bg-secondary',
        'text-secondary',
        'bg-accent',
        'text-accent',
        'bg-selected',
        'text-selected',
        'bg-destructive',
        'text-destructive',
        'bg-card',
        'text-card',
        'bg-ring',
        'text-ring',
        'bg-sidebar',
        'text-sidebar',
        'bg-gold-\\d+',
        'text-gold-\\d+',
        'border-gold-\\d+',
      ],
    },
  },
};