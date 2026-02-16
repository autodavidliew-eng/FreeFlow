module.exports = {
  extends: [require.resolve('@freeflow/config/eslint/nest')],
  parserOptions: {
    project: ['./tsconfig.eslint.json'],
    tsconfigRootDir: __dirname,
  },
  overrides: [
    {
      files: ['.eslintrc.js'],
      parserOptions: {
        project: null,
      },
    },
  ],
};
