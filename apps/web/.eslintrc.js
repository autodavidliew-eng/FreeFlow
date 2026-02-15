/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

module.exports = {
  extends: [require.resolve('@freeflow/config/eslint/next')],
  settings: {
    next: {
      rootDir: __dirname,
    },
    'import/resolver': {
      typescript: {
        project: path.join(__dirname, 'tsconfig.json'),
      },
    },
  },
};
