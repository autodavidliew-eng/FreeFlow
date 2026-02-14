/**
 * Commitlint configuration
 * Enforces conventional commit message format
 *
 * Format: <type>(<scope>): <subject>
 * Example: feat(api): add user authentication endpoint
 *
 * Types:
 * - feat: New feature
 * - fix: Bug fix
 * - docs: Documentation changes
 * - style: Code style changes (formatting, etc.)
 * - refactor: Code refactoring
 * - perf: Performance improvements
 * - test: Adding or updating tests
 * - build: Build system changes
 * - ci: CI/CD changes
 * - chore: Other changes (dependencies, etc.)
 */

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type must be one of the following
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
    // Scope is optional but recommended
    'scope-case': [2, 'always', 'lower-case'],
    // Subject must not be empty
    'subject-empty': [2, 'never'],
    // Subject must not end with period
    'subject-full-stop': [2, 'never', '.'],
    // Subject must be lowercase
    'subject-case': [2, 'always', 'lower-case'],
    // Body should have blank line before it
    'body-leading-blank': [2, 'always'],
    // Footer should have blank line before it
    'footer-leading-blank': [2, 'always'],
    // Max line length
    'header-max-length': [2, 'always', 100],
  },
};
