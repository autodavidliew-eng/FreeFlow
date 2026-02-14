/**
 * Lint-staged configuration
 * Runs quality checks on staged files before commit
 *
 * This ensures that only properly formatted and linted code
 * gets committed to the repository.
 */

module.exports = {
  // TypeScript and JavaScript files
  '**/*.{ts,tsx,js,jsx}': (filenames) => {
    const escapedFileNames = filenames
      .map((filename) => `"${filename}"`)
      .join(' ');

    return [
      // Format with Prettier
      `prettier --write ${escapedFileNames}`,
      // Lint with ESLint and auto-fix
      `eslint --fix ${escapedFileNames}`,
      // Type check (only for TS files)
      filenames.some((f) => f.endsWith('.ts') || f.endsWith('.tsx'))
        ? 'pnpm run typecheck'
        : null,
    ].filter(Boolean);
  },

  // JSON, YAML, Markdown files
  '**/*.{json,yml,yaml,md}': (filenames) => {
    const escapedFileNames = filenames
      .map((filename) => `"${filename}"`)
      .join(' ');

    return [
      // Format with Prettier
      `prettier --write ${escapedFileNames}`,
    ];
  },

  // Package.json files - ensure consistent formatting
  '**/package.json': (filenames) => {
    return [
      `prettier --write ${filenames.map((f) => `"${f}"`).join(' ')}`,
    ];
  },
};
